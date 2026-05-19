import { Check } from "lucide-solid";
import { Component, createSignal } from "solid-js";
import FiPortal from "../../components/portal/FiPortal";

const HomePage: Component<{ children: Element }> = (props) => {
  const [isOpen, setIsOpen] = createSignal(true);

  const toggle = () => setIsOpen(prev => !prev);

  return (
    <div class="card card-lg shadow-lg bg-base-500 w-96 h-96 flex justify-center items-center">
      <button class="btn btn-square" onclick={toggle}>
        <Check />
        {props.children}
      </button>
      <FiPortal isOpen={isOpen()} onClose={toggle}>
        <div class="card bg-base w-full h-full flex justify-center items-center">
          <div class="card size-96 bg-white flex flex-col items-center py-8" onclick={e => e.stopPropagation()}>
            <div class="card-title">
              <h1>Giriş Yap</h1>
            </div>
            <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
              <legend class="fieldset-legend">Page details</legend>

              <label class="label">Title</label>
              <input type="text" class="input" placeholder="My awesome page" />

              <label class="label">Slug</label>
              <input type="text" class="input" placeholder="my-awesome-page" />

              <label class="label">Author</label>
              <input type="text" class="input" placeholder="Name" />
            </fieldset>          </div>
        </div>
      </FiPortal>
    </div>
  )
}

export default HomePage;
