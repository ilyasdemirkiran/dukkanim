import {
  Package,
  ShoppingCart,
  Users,
} from "lucide-solid";
import { Component, For, JSXElement } from "solid-js";

const HomePage: Component = () => {
  const navigations: NavigationProps[] = [
    {
      icon: <Users class="w-8 h-8" />,
      label: "Müşteriler",
      description: "Müşteri listesini görüntüle",
    },
    {
      icon: <Package class="w-8 h-8" />,
      label: "Ürünler",
      description: "Ürünlerini yönet",
    },
    {
      icon: <ShoppingCart class="w-8 h-8" />,
      label: "Satışlar",
      description: "Sipariş ve satış takibi",
    },
  ];

  return (
    <div class="flex flex-col gap-4 p-4 flex-1">
      <div class="grid grid-cols-1 gap-4">
        <For each={navigations}>
          {(item) => <Navigation {...item} />}
        </For>
      </div>
    </div>
  );
};

export default HomePage;

type NavigationProps = {
  icon: JSXElement;
  label: string;
  description: string;
};

const Navigation: Component<NavigationProps> = (props) => {
  return (
    <button
      class="
        w-full
        h-48
        rounded-3xl
        bg-base-200
        active:scale-[0.98]
        transition-all
        duration-150
        p-5
        shadow-sm
        border
        border-base-300
      "
    >
      <div class="flex items-center gap-4">
        <div
          class="
            w-14
            h-14
            rounded-2xl
            bg-primary/10
            text-primary
            flex
            items-center
            justify-center
            shrink-0
          "
        >
          {props.icon}
        </div>

        <div class="flex flex-col items-start text-left flex-1">
          <span class="text-xl font-semibold">
            {props.label}
          </span>

          <span class="text-sm text-base-content/60 mt-1">
            {props.description}
          </span>
        </div>
      </div>
    </button>
  );
};
