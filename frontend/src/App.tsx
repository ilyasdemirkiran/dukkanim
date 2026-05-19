import { Camera, X, Check } from 'lucide-solid';
import type { Component } from 'solid-js';

const App: Component = () => {
  return (
    <div class="flex flex-col items-center justify-center h-screen p-4 bg-white">
      <div class="card bg-base-100 w-96 h-96 shadow-2xl flex flex-row justify-center items-center p-2 space-x-2 rounded-box">
        <button class="btn btn-soft flex flex-row flex-1">
          <X />
          Cancel
        </button>
        <button class="btn btn-success flex flex-row flex-1">
          <Check />
          Ok
        </button>
      </div>
    </div>
  );
};

export default App;
