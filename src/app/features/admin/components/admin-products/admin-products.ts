import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { AdminProduct, ProductRequest } from '../../../../core/models/product.model';
import { Category } from '../../../../core/models/category.model';
import { ProductService } from '../../../../core/services/product.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CloudinaryUploadService } from '../../../../core/services/cloudinary-upload.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.scss',
})
export class AdminProducts implements OnInit {
  showAddForm = signal(false);
  showEditForm = signal(false);
  searchQuery = signal('');
  selectedCategory = signal('');
  isLoading = signal(true);
  isSaving = signal(false);
  deleteConfirmId = signal<number | null>(null);

  products = signal<AdminProduct[]>([]);
  categories = signal<Category[]>([]);

  emptyForm = {
    name: '',
    description: '',
    specifications: '',
    retailPrice: null as number | null,
    wholesalePrice: null as number | null,
    costPrice: null as number | null,
    stock: null as number | null,
    emoji: '📦',
    imageUrls: ['', '', '', ''] as string[],
    badge: '',
    categoryId: 0
  }

  newProduct = signal({
    ...this.emptyForm
  });

  editProduct = signal<any>(null);

  uploadingSlot = signal<string | null>(null); // 'new-0', 'edit-2', etc.

  constructor(
    private productService: ProductService,
    private toast: ToastService,
    private cloudinaryUpload: CloudinaryUploadService
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getAdminProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    })
  }

  loadCategories() {
    this.productService.getAllCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: () => {}
    });
  }

  get filteredProducts() {
    return this.products().filter((p: AdminProduct)=> {
      const matchSearch = p.name.toLowerCase().includes(this.searchQuery().toLowerCase());
      const matchcat = !this.selectedCategory() || p.categorySlug === this.selectedCategory();
      return matchSearch && matchcat;
    })
  }

  onSearchInput(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onCategoryFilter(event: Event) {
    this.selectedCategory.set((event.target as HTMLSelectElement).value);
  }

 
    onNewFieldInput(field: string, event: Event) {
    const target = event.target as
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const value = target.value;
    const numericFields = [
      'retailPrice', 'wholesalePrice',
      'costPrice', 'stock', 'categoryId'
    ];
    this.newProduct.update(p => ({
      ...p,
      [field]: numericFields.includes(field)
        ? (value === '' ? null : Number(value))
        : value
    }));
  }

  onEditFieldInput(field: string, event: Event) {
    const target = event.target as
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const value = target.value;
    const numericFields = [
      'retailPrice', 'wholesalePrice',
      'costPrice', 'stock', 'categoryId'
    ];
    this.editProduct.update((p: any) => ({
      ...p,
      [field]: numericFields.includes(field)
        ? (value === '' ? null : Number(value))
        : value
    }));
  }

  openEditForm(product: AdminProduct) {
    const category = this.categories().find(
      c => c.slug === product.categorySlug
    );

    const imageUrls = product.imageUrls || [];
    while (imageUrls.length < 4) imageUrls.push('');

    this.editProduct.set({
      id: product.id,
      name: product.name,
      description: product.description || '',
      specifications: product.specifications || '',
      retailPrice: product.retailPrice,
      wholesalePrice: product.wholesalePrice,
      costPrice: product.costPrice || 0,
      stock: product.stock,
      emoji : product.emoji || '📦',
      imageUrls: imageUrls,
      badge: product.badge || '',
      categoryId: category?.id || 0
    });

    this.showEditForm.set(true);
  }

  closeEditForm() {
    this.showEditForm.set(false);
    this.editProduct.set(null);
  }

  addProduct() {
    const p = this.newProduct();

    if (!p.name || !p.categoryId || !p.retailPrice) return;

    this.isSaving.set(true);
    const request: ProductRequest = {
      name: p.name,
      description: p.description?.trim() || '',
      specifications: p.specifications?.trim() || undefined,
      retailPrice: p.retailPrice!,
      wholesalePrice: p.wholesalePrice || p.retailPrice,
      costPrice: p.costPrice || undefined,
      stock: p.stock || 0,
      emoji: p.emoji,
      imageUrls: p.imageUrls.filter(url =>
        url && url.trim() !== ''
      ),
      badge: p.badge || undefined,
      categoryId: p.categoryId
    };

    this.productService.createProduct(request).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showAddForm.set(false);
        this.newProduct.set({...this.emptyForm});
        this.loadProducts();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.toast.error('Failed to add products: ' + (err.error?.message || 'Unknown error' ));
      }
    })
  }

  saveEdit() {
    const p = this.editProduct();
    if(!p || !p.name || !p.categoryId) return;

    this.isSaving.set(true);

    const request: ProductRequest = {
      name: p.name,
      description: p.description?.trim() || '',
      specifications: p.specifications?.trim() || undefined,
      retailPrice: p.retailPrice,
      wholesalePrice: p.wholesalePrice,
      costPrice: p.costPrice || undefined,
      stock: p.stock,
      emoji: p.emoji,
      imageUrls: p.imageUrls.filter((url: string) =>
        url && url.trim() !== ''
      ),
      badge: p.badge || undefined,
      categoryId: p.categoryId
    };

    this.productService.updateProduct(p.id, request).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeEditForm();
        this.loadProducts();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.toast.error('Failed to update product: ' + (err.error?.message || 'Unknown error'));
      }
    })
  }

  confirmDelete(id: number) {
    this.deleteConfirmId.set(id);
  }

  cancelDelete() {
    this.deleteConfirmId.set(null);
  }

  deleteProduct(id: number) {
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.deleteConfirmId.set(null);
        this.loadProducts();
      },
      error: () => {
        this.toast.error('Failed to delete product');
        this.deleteConfirmId.set(null);
      }
    })
  }

  getStatusClass(product: AdminProduct): string {
    if (!product.inStock) return 'status--out';
    if (product.stock < 10) return 'status--low';
    return 'status--active';
  }

  getStatusLabel(product: AdminProduct): string {
    if (!product.inStock) return 'Out of Stock';
    if (product.stock < 10) return 'Low Stock';
    return 'Active';
  }

  onImageUrlInput(index: number, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.newProduct.update(p => {
      const urls = [...p.imageUrls];
      urls[index] = value;
      return {...p, imageUrls: urls};
    });
  }

  onEditImageUrlInput(index: number, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.editProduct.update((p: any) => {
      const urls = [...(p.imageUrls || ['','',''])];
      urls[index] = value;
      return {...p, imageUrls: urls};
    })
  }

  triggerFileInput(id: string) {
    document.getElementById(id)?.click();
  }

  async onNewFileSelected(index: number, event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const slot = `new-${index}`;
    this.uploadingSlot.set(slot);
    try {
      const url = await this.cloudinaryUpload.upload(file);
      this.newProduct.update(p => {
        const urls = [...p.imageUrls];
        urls[index] = url;
        return { ...p, imageUrls: urls };
      });
    } catch {
      this.toast.error('Image upload failed. Please try again.');
    } finally {
      this.uploadingSlot.set(null);
      (event.target as HTMLInputElement).value = '';
    }
  }

  async onEditFileSelected(index: number, event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const slot = `edit-${index}`;
    this.uploadingSlot.set(slot);
    try {
      const url = await this.cloudinaryUpload.upload(file);
      this.editProduct.update((p: any) => {
        const urls = [...(p.imageUrls || ['', '', '', ''])];
        urls[index] = url;
        return { ...p, imageUrls: urls };
      });
    } catch {
      this.toast.error('Image upload failed. Please try again.');
    } finally {
      this.uploadingSlot.set(null);
      (event.target as HTMLInputElement).value = '';
    }
  }

  trackByIndex(index: number): number {
    return index;
  }
}