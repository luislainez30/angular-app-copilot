import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageTitleComponent } from '../../shared/components/page-title/page-title.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, PageTitleComponent],
  template: `
    <div class="min-h-screen bg-slate-50">
      <!-- Page Title Bar -->
      <app-page-title 
        title="Dashboard" 
        subtitle="Welcome to your store management system dashboard">
      </app-page-title>

      <!-- Content Area -->
      <div class="max-w-7xl mx-auto px-4 py-8">
        <!-- Quick Stats Cards -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          <div class="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                    <span class="material-icons text-blue-600" style="font-size: 24px;">people</span>
                  </div>
                </div>
                <div class="ml-6 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-slate-500 truncate">Total Customers</dt>
                    <dd class="text-2xl font-bold text-slate-900">1,234</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
                    <span class="material-icons text-green-600" style="font-size: 24px;">point_of_sale</span>
                  </div>
                </div>
                <div class="ml-6 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-slate-500 truncate">Total Sales</dt>
                    <dd class="text-2xl font-bold text-slate-900">$45,231</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center">
                    <span class="material-icons text-purple-600" style="font-size: 24px;">inventory</span>
                  </div>
                </div>
                <div class="ml-6 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-slate-500 truncate">Products</dt>
                    <dd class="text-2xl font-bold text-slate-900">567</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="h-12 w-12 rounded-lg bg-orange-50 flex items-center justify-center">
                    <span class="material-icons text-orange-600" style="font-size: 24px;">shopping_cart</span>
                  </div>
                </div>
                <div class="ml-6 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-slate-500 truncate">Orders Today</dt>
                    <dd class="text-2xl font-bold text-slate-900">23</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions Grid -->
        <div class="mb-10">
          <h2 class="text-xl font-semibold text-slate-900 mb-6">Quick Actions</h2>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <a routerLink="/customers" 
               class="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <div class="flex items-start gap-4">
                <div class="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-100 transition-colors">
                  <span class="material-icons" style="font-size: 22px;">people</span>
                </div>
                <div class="min-w-0">
                  <h3 class="text-base font-semibold text-slate-900 group-hover:text-blue-900">Manage Customers</h3>
                  <p class="mt-2 text-sm text-slate-600">View, add, and edit customer information</p>
                </div>
              </div>
            </a>

            <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm opacity-60">
              <div class="flex items-start gap-4">
                <div class="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <span class="material-icons" style="font-size: 22px;">point_of_sale</span>
                </div>
                <div class="min-w-0">
                  <h3 class="text-base font-semibold text-slate-900">Sales</h3>
                  <p class="mt-2 text-sm text-slate-600">Create invoices, track payments, manage daily sales</p>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm opacity-60">
              <div class="flex items-start gap-4">
                <div class="grid h-12 w-12 place-items-center rounded-xl bg-sky-50 text-sky-700">
                  <span class="material-icons" style="font-size: 22px;">shopping_cart</span>
                </div>
                <div class="min-w-0">
                  <h3 class="text-base font-semibold text-slate-900">Purchases</h3>
                  <p class="mt-2 text-sm text-slate-600">Register supplier purchases and update stock</p>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm opacity-60">
              <div class="flex items-start gap-4">
                <div class="grid h-12 w-12 place-items-center rounded-xl bg-purple-50 text-purple-700">
                  <span class="material-icons" style="font-size: 22px;">inventory</span>
                </div>
                <div class="min-w-0">
                  <h3 class="text-base font-semibold text-slate-900">Inventory</h3>
                  <p class="mt-2 text-sm text-slate-600">Monitor stock levels, manage product catalog</p>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm opacity-60">
              <div class="flex items-start gap-4">
                <div class="grid h-12 w-12 place-items-center rounded-xl bg-orange-50 text-orange-700">
                  <span class="material-icons" style="font-size: 22px;">assessment</span>
                </div>
                <div class="min-w-0">
                  <h3 class="text-base font-semibold text-slate-900">Reports</h3>
                  <p class="mt-2 text-sm text-slate-600">Generate insights and detailed business reports</p>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm opacity-60">
              <div class="flex items-start gap-4">
                <div class="grid h-12 w-12 place-items-center rounded-xl bg-pink-50 text-pink-700">
                  <span class="material-icons" style="font-size: 22px;">analytics</span>
                </div>
                <div class="min-w-0">
                  <h3 class="text-base font-semibold text-slate-900">Analytics</h3>
                  <p class="mt-2 text-sm text-slate-600">Track performance metrics and growth trends</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white shadow-sm rounded-xl border border-slate-200">
          <div class="px-6 py-5 border-b border-slate-200">
            <h3 class="text-lg font-semibold text-slate-900">Recent Activity</h3>
          </div>
          <div class="p-6">
            <div class="space-y-6">
              <div class="flex items-center space-x-4">
                <div class="flex-shrink-0">
                  <div class="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                    <span class="material-icons text-green-600 text-sm">check_circle</span>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-900">Customer "John Doe" was successfully created</p>
                  <p class="text-sm text-slate-500">2 minutes ago</p>
                </div>
              </div>
              <div class="flex items-center space-x-4">
                <div class="flex-shrink-0">
                  <div class="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <span class="material-icons text-blue-600 text-sm">info</span>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-900">System backup completed successfully</p>
                  <p class="text-sm text-slate-500">1 hour ago</p>
                </div>
              </div>
              <div class="flex items-center space-x-4">
                <div class="flex-shrink-0">
                  <div class="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
                    <span class="material-icons text-orange-600 text-sm">warning</span>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-900">Low stock alert for "Premium Coffee Beans"</p>
                  <p class="text-sm text-slate-500">3 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class HomeComponent {

}