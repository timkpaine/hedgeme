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
  BoxPanel, CommandPalette, ContextMenu, DockPanel, MenuBar, Widget, DockLayout, Menu
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

const commands = new CommandRegistry();

function main(): void {

  /* File Menu */
  let menu = new Menu({ commands });
  menu.title.label = 'File';
  menu.title.mnemonic = 0;

  menu.addItem({ command: 'controls:open' });
  menu.addItem({ type: 'separator'});

  /* Data Menu */
  let menu2 = new Menu({ commands });
  menu2.title.label = 'Data';
  menu2.title.mnemonic = 0;

  menu2.addItem({ command: 'performance:open' });
  menu2.addItem({ command: 'quotes:open' });
  menu2.addItem({ command: 'dividends:open' });
  menu2.addItem({ command: 'markets:open' });
  menu2.addItem({ type: 'separator'});
  menu2.addItem({ command: 'cashflow:open' });
  menu2.addItem({ command: 'financials:open' });
  menu2.addItem({ command: 'stats:open' });
  menu2.addItem({ command: 'earnings:open' });
  menu2.addItem({ command: 'news:open' });
  menu2.addItem({ command: 'peers:open' });

  /* layouts menu */
  let menu3 = new Menu({ commands });
  menu3.title.label = 'Layout';
  menu3.title.mnemonic = 0;

  menu3.addItem({ command: 'save-dock-layout'});
  menu3.addItem({ type: 'separator'});
  menu3.addItem({ command: 'restore-dock-layout', args: {index: 0}});

  /* Top bar */
  let bar = new MenuBar();
  bar.addMenu(menu);
  bar.addMenu(menu2);
  bar.addMenu(menu3);
  bar.id = 'menuBar';

  /* context menu */
  let contextMenu = new ContextMenu({ commands });

  document.addEventListener('contextmenu', (event: MouseEvent) => {
    if (contextMenu.open(event)) {
      event.preventDefault();
    }
  });

  contextMenu.addItem({ command: 'controls:open', selector: '.content' });
  contextMenu.addItem({ type: 'separator', selector: '.p-CommandPalette-input' });
  contextMenu.addItem({ command: 'save-dock-layout', selector: '.content' });
  contextMenu.addItem({ command: 'restore-dock-layout', selector: '.content' });

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    commands.processKeydownEvent(event);
  });


  /* perspectives */
  let psp = new PSPWidget('Performance');  // chart
  let psp2 = new PSPWidget('Quotes');  // quote
  let psp3 = new PSPWidget('Dividends'); //dividends
  let psp4 = new PSPWidget('Cashflow');
  let psp5 = new PSPWidget('Financials'); // financials
  let psp6 = new PSPWidget('Earnings');
  let psp7 = new PSPWidget('News');
  let psp8 = new PSPWidget('Peers');
  let psp9 = new PSPWidget('Stats');
  let psp10 = new PSPWidget('Markets');
  let ctrl = new ControlsWidget('JPM', {'chart':psp,
                                        'quote':psp2,
                                        'dividends': psp3,
                                        'cashflow': psp4,
                                        'financials': psp5,
                                        'earnings': psp6,
                                        'news': psp7,
                                        'peers': psp8,
                                        'stats': psp9,
                                        'markets':psp10});

  /* main dock */
  let dock = new DockPanel();
  dock.addWidget(ctrl);
  dock.addWidget(psp, { mode: 'split-right', ref: ctrl });
  dock.addWidget(psp2, { mode: 'tab-after', ref: psp });
  dock.addWidget(psp3, { mode: 'tab-after', ref: psp2 });
  dock.addWidget(psp10, { mode: 'tab-after', ref: psp3 });

  dock.addWidget(psp4, { mode: 'split-bottom', ref: psp });
  dock.addWidget(psp5, { mode: 'tab-after', ref: psp4 });
  dock.addWidget(psp9, { mode: 'tab-after', ref: psp5 });
  dock.addWidget(psp6, { mode: 'tab-after', ref: psp9 });
  dock.addWidget(psp7, { mode: 'tab-after', ref: psp6 });
  dock.addWidget(psp8, { mode: 'tab-after', ref: psp7 });
  dock.id = 'dock';

  /* save/restore layouts */
  let savedLayouts: DockPanel.ILayoutConfig[] = [];

  /* command palette */
  let palette = new CommandPalette({ commands });
  palette.id = 'palette';

  palette.addItem({
    command: 'save-dock-layout',
    category: 'Dock Layout',
    rank: 0
  });

  palette.addItem({
    command: 'controls:open',
    category: 'Dock Layout',
    rank: 0
  });


  /* command registry */
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
      menu3.addItem({ command: 'restore-dock-layout', args: {index: savedLayouts.length - 1}});
    }
  });

  commands.addCommand('restore-dock-layout', {
    label: args => {
      console.log(args.index);
      return `Restore Layout ${args.index as number}`;
    },
    execute: args => {
      dock.restoreLayout(savedLayouts[args.index as number]);
    }
  });

  commands.addCommand('controls:open', {
    label: 'Controls',
    mnemonic: 1,
    iconClass: 'fa fa-plus',
    execute: () => {
      dock.restoreLayout(savedLayouts[0]);
    }
  });

  /* hack for custom sizing */
  var layout = dock.saveLayout();
  var sizes: number[] = (layout.main as DockLayout.ISplitAreaConfig).sizes;
  sizes[0] = 0.3;
  sizes[1] = 0.7;
  dock.restoreLayout(layout);
  savedLayouts.push(dock.saveLayout());
  palette.addItem({
    command: 'restore-dock-layout',
    category: 'Dock Layout',
    args: { index: 0}
  });

  /* main area setup */
  BoxPanel.setStretch(dock, 1);

  let main = new BoxPanel({ direction: 'left-to-right', spacing: 0 });
  main.id = 'main';
  main.addWidget(dock);

  window.onresize = () => { main.update(); };

  Widget.attach(bar, document.body);
  Widget.attach(main, document.body);
}


window.onload = main;




