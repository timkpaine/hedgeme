/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import 'es6-promise/auto';  // polyfill Promise on IE

import {
  CommandRegistry
} from '@phosphor/commands';

import {
  BoxPanel, CommandPalette, ContextMenu, DockPanel, MenuBar, Widget, DockLayout
} from '@phosphor/widgets';

import '../ts/style/index.css';
import "@jpmorganchase/perspective-viewer";
import "@jpmorganchase/perspective-viewer-hypergrid";
import "@jpmorganchase/perspective-viewer-highcharts";

import {
  PSPWidget
} from './psp';

import {
  ControlsWidget
} from './controls';

import {
  createMenu
} from './menus';

const commands = new CommandRegistry();

function main(): void {

  commands.addCommand('example:copy', {
    label: 'Copy',
    mnemonic: 0,
    iconClass: 'fa fa-copy',
    execute: () => {
      console.log('Copy');
    }
  });

  commands.addCommand('example:close', {
    label: 'Close',
    mnemonic: 0,
    iconClass: 'fa fa-close',
    execute: () => {
      console.log('Close');
    }
  });

  // commands.addKeyBinding({
  //   keys: ['Accel C'],
  //   selector: 'body',
  //   command: 'example:copy'
  // });

  // commands.addKeyBinding({
  //   keys: ['Accel V'],
  //   selector: 'body',
  //   command: 'example:paste'
  // });

  // commands.addKeyBinding({
  //   keys: ['Accel J', 'Accel J'],
  //   selector: 'body',
  //   command: 'example:new-tab'
  // });

  let menu1 = createMenu(commands);
  menu1.title.label = 'File';
  menu1.title.mnemonic = 0;

  let bar = new MenuBar();
  bar.addMenu(menu1);
  bar.id = 'menuBar';

  let palette = new CommandPalette({ commands });
  palette.addItem({ command: 'example:copy', category: 'Edit' });
  palette.addItem({ command: 'example:paste', category: 'Edit' });
  palette.addItem({ command: 'example:new-tab', category: 'File' });
  palette.addItem({ command: 'example:close-tab', category: 'File' });
  palette.addItem({ command: 'example:close', category: 'File' });
  palette.id = 'palette';

  let contextMenu = new ContextMenu({ commands });

  document.addEventListener('contextmenu', (event: MouseEvent) => {
    if (contextMenu.open(event)) {
      event.preventDefault();
    }
  });

  contextMenu.addItem({ command: 'example:copy', selector: '.content' });
  contextMenu.addItem({ command: 'example:paste', selector: '.content' });
  contextMenu.addItem({ type: 'separator', selector: '.p-CommandPalette-input' });

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    commands.processKeydownEvent(event);
  });

  let psp = new PSPWidget('Performance');
  let psp2 = new PSPWidget('Cashflow');
  let psp3 = new PSPWidget('Markets');
  let ctrl = new ControlsWidget('JPM', {'cash':psp2, 'chart':psp, 'markets':psp3});

  let dock = new DockPanel();
  dock.addWidget(ctrl);
  dock.addWidget(psp, { mode: 'split-right', ref: ctrl });
  dock.addWidget(psp2, { mode: 'split-bottom', ref: psp });
  dock.addWidget(psp3, { mode: 'tab-after', ref: psp });
  dock.id = 'dock';

  /* hack for custom sizing */
  var layout = dock.saveLayout();
  var sizes: number[] = (layout.main as DockLayout.ISplitAreaConfig).sizes;
  sizes[0] = 0.3;
  sizes[1] = 0.7;
  dock.restoreLayout(layout);

  let savedLayouts: DockPanel.ILayoutConfig[] = [];

  commands.addCommand('save-dock-layout', {
    label: 'Save Layout',
    caption: 'Save the current dock layout',
    execute: () => {
      savedLayouts.push(dock.saveLayout());
      palette.addItem({
        command: 'restore-dock-layout',
        category: 'Dock Layout',
        args: { index: savedLayouts.length - 1 }
      });
    }
  });

  commands.addCommand('restore-dock-layout', {
    label: args => {
      return `Restore Layout ${args.index as number}`;
    },
    execute: args => {
      dock.restoreLayout(savedLayouts[args.index as number]);
    }
  });

  palette.addItem({
    command: 'save-dock-layout',
    category: 'Dock Layout',
    rank: 0
  });

  BoxPanel.setStretch(dock, 1);

  let main = new BoxPanel({ direction: 'left-to-right', spacing: 0 });
  main.id = 'main';
  main.addWidget(dock);

  window.onresize = () => { main.update(); };

  Widget.attach(bar, document.body);
  Widget.attach(main, document.body);





}


window.onload = main;




