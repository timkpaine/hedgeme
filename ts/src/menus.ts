import {
  CommandRegistry
} from '@phosphor/commands';


import {
  Menu
} from '@phosphor/widgets';

import '../ts/style/index.css';


export
function createMenu(commands: CommandRegistry): Menu {
  // let sub1 = new Menu({ commands });
  // sub1.title.label = 'More...';
  // sub1.title.mnemonic = 0;
  // sub1.addItem({ command: 'example:one' });
  // sub1.addItem({ command: 'example:two' });
  // sub1.addItem({ command: 'example:three' });
  // sub1.addItem({ command: 'example:four' });

  // let sub2 = new Menu({ commands });
  // sub2.title.label = 'More...';
  // sub2.title.mnemonic = 0;
  // sub2.addItem({ command: 'example:one' });
  // sub2.addItem({ command: 'example:two' });
  // sub2.addItem({ command: 'example:three' });
  // sub2.addItem({ command: 'example:four' });
  // sub2.addItem({ type: 'submenu', submenu: sub1 });

  let root = new Menu({ commands });
  root.addItem({ command: 'example:copy' });
  // root.addItem({ command: 'example:paste' });
  // root.addItem({ type: 'separator' });
  // root.addItem({ command: 'example:new-tab' });
  // root.addItem({ command: 'example:close-tab' });
  // root.addItem({ type: 'separator' });
  // root.addItem({ type: 'submenu', submenu: sub2 });
  // root.addItem({ type: 'separator' });
  root.addItem({ command: 'example:close' });

  return root;
}