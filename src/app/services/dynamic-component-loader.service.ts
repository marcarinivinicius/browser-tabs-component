import { ComponentRef, Injectable, Injector, Type, ViewContainerRef } from '@angular/core';
import { TestComponent } from '../example/test/test.component';
import { Test1Component } from '../example/test1/test1.component';

@Injectable({
    providedIn: 'root',
})
export class DynamicComponentLoaderService {
    private componentMap: Record<string, Type<any>> = {
        'TestComponent': TestComponent,
        'Test1Component': Test1Component
    };

    constructor(private injector: Injector) {}

    loadComponent(componentName: string, viewContainerRef: ViewContainerRef): ComponentRef<any> | null {
        const componentType = this.componentMap[componentName];

        if (!componentType) {
            console.error(`Componente ${componentName} não encontrado.`);
            return null;
        }

        viewContainerRef.clear(); // Remove qualquer componente anterior antes de injetar um novo
        return viewContainerRef.createComponent(componentType, { injector: this.injector });
    }
}
