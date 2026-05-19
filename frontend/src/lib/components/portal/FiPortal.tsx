import { JSX, Show } from "solid-js";
import { Portal } from "solid-js/web";

type FiPortalProps = {
  children: JSX.Element;
  isOpen: boolean;
  onClose: () => void;
}

const FiPortal = (props: FiPortalProps) => {
  return (
    <Show when={props.isOpen}>
      <Portal ref={document.getElementById("fi-portal")! as HTMLDivElement}>
        <div
          class="fixed inset-0 z-150 bg-black/40 backdrop-blur-sm" onClick={props.onClose}
        >
          {props.children}
        </div>
      </Portal>
    </Show>
  );
}

export default FiPortal;
