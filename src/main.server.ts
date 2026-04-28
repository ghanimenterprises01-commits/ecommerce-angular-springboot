import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { config } from './app/app.config.server';
import { App } from './app/app';

export default function bootstrap(context: BootstrapContext) {
  return bootstrapApplication(App, config, context);
}