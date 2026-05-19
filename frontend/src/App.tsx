import type { Component } from 'solid-js';
import MainDrawer from './lib/components/drawer/MainDrawer';

const App: Component<{ children: Element }> = (props) => {
  return (
    <div class="flex flex-col items-center justify-center h-screen p-4 bg-white">
      <MainDrawer />
      {props.children}
    </div>
  );
};

export default App;
