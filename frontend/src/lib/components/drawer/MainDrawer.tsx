import { Package, ShoppingCart, Users } from "lucide-solid";
import { Component } from "solid-js";


const MainDrawer: Component = () => {

  return (
    <div class="drawer">
      <input id="main-drawer" type="checkbox" class="drawer-toggle" />
      <div class="drawer-side safe-area-container py-4">
        <label for="main-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
        <ul class="menu bg-base-200 rounded-box h-full w-48">
          <li>
            <a class="tooltip tooltip-right" data-tip="Müşteriler">
              <Users class="w-8 h-8" />
              Müşteriler
            </a>
          </li>
          <li>
            <a class="tooltip tooltip-right" data-tip="Müşteriler">
              <Package class="w-8 h-8" />
              Ürünler
            </a>
          </li>
          <li>
            <a class="tooltip tooltip-right" data-tip="Müşteriler">
              <ShoppingCart class="w-8 h-8" />
              Satışlar
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default MainDrawer;
