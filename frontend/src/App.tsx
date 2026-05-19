import { onMount, type Component } from 'solid-js';
import MainDrawer from './lib/components/drawer/MainDrawer';
import { Menu, Package, ShoppingCart, Users } from 'lucide-solid';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { Capacitor } from '@capacitor/core';

const App: Component<{ children: Element }> = (props) => {
  onMount(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    CapacitorUpdater.notifyAppReady();
  });


  return (
    <div class="safe-area-container">
      <MainDrawer />
      <div class="flex flex-col items-center h-screen p-4 bg-base-500">
        {props.children}
        <FooterMenu />
      </div>
    </div>
  );
};

const FooterMenu: Component = () => {
  return (
    <div
      class="
    fixed
    bottom-0
    left-0
    right-0
    px-4
    pb-[max(env(safe-area-inset-bottom),16px)]
    z-50
  "
    >
      <ul
        class="
      menu
      menu-horizontal
      bg-base-100
      rounded-3xl
      w-full
      h-16
      shadow-lg
      border
      border-base-300
      grid
      grid-cols-4
      gap-2
      p-2
    "
      >
        <li>
          <label for="main-drawer" class="btn drawer-button shadow-sm rounded-2xl justify-center items-center active:bg-base-200">
            <Menu class='w-7 h-7' />
          </label>
        </li>
        <li>
          <a class="rounded-2xl justify-center items-center active:bg-base-200">
            <Users class="w-7 h-7" />
          </a>
        </li>

        <li>
          <a class="rounded-2xl justify-center items-center active:bg-base-200">
            <Package class="w-7 h-7" />
          </a>
        </li>

        <li>
          <a class="rounded-2xl justify-center items-center active:bg-base-200">
            <ShoppingCart class="w-7 h-7" />
          </a>
        </li>
      </ul>
    </div>
  )
}

export default App;
