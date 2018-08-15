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
} from './perspective-widget';

import {
    TableWidget
} from './table';

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
  menu2.addItem({ command: 'peerCorrelation:open' });
  menu2.addItem({ command: 'composition:open' });

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
  let performance = new PSPWidget('Performance');  // chart
  let quotes = new PSPWidget('Quotes');  // quote
  let dividends = new PSPWidget('Dividends'); //dividends
  let cashflow = new PSPWidget('Cashflow');
  let financials = new PSPWidget('Financials'); // financials
  let earnings = new PSPWidget('Earnings');
  let peers = new PSPWidget('Peers');
  let markets = new PSPWidget('Markets');
  let peercorrelation = new PSPWidget('PeerCorrelation');
  let composition = new PSPWidget('Composition');

  let psps= {'chart':performance,
             'quote':quotes,
             'dividends': dividends,
             'cashflow': cashflow,
             'financials': financials,
             'earnings': earnings,
             'peers': peers,
             'markets':markets,
             'peerCorrelation': peercorrelation,
             'composition': composition}

  let table1 = new TableWidget('Stats');
  let table2 = new TableWidget('News');
  let tables = {'stats': table1,
                'news': table2};

  let ctrl = new ControlsWidget('JPM', psps, tables);

  /* main dock */
  let dock = new DockPanel();
  dock.addWidget(ctrl);
  dock.addWidget(table1, {mode: 'tab-after', ref:ctrl});
  dock.addWidget(table2, {mode: 'tab-after', ref:table1});
  dock.addWidget(psps['composition'], { mode: 'tab-after', ref: table2 });

  dock.addWidget(psps['cashflow'], { mode: 'split-bottom', ref: ctrl });
  dock.addWidget(psps['financials'], { mode: 'tab-after', ref: cashflow });
  dock.addWidget(psps['earnings'], { mode: 'tab-after', ref: financials });
  dock.addWidget(psps['peerCorrelation'], { mode: 'split-right', ref: cashflow});
  dock.addWidget(psps['peers'], { mode: 'tab-after', ref: peercorrelation });

  dock.addWidget(psps['chart'], { mode: 'split-right', ref: ctrl });
  dock.addWidget(psps['quote'], { mode: 'tab-after', ref: performance });
  dock.addWidget(psps['dividends'], { mode: 'tab-after', ref: quotes });
  dock.addWidget(psps['markets'], { mode: 'tab-after', ref: dividends });
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

  palette.addItem({
    command: 'performance:open',
    category: 'Dock Layout',
    rank: 0
  });

  palette.addItem({
    command: 'quotes:open',
    category: 'Dock Layout',
    rank: 0
  });

  palette.addItem({
    command: 'dividends:open',
    category: 'Dock Layout',
    rank: 0
  });

  palette.addItem({
    command: 'markets:open',
    category: 'Dock Layout',
    rank: 0
  });

  palette.addItem({
    command: 'cashflow:open',
    category: 'Dock Layout',
    rank: 0
  });

  palette.addItem({
    command: 'financials:open',
    category: 'Dock Layout',
    rank: 0
  });

  palette.addItem({
    command: 'stats:open',
    category: 'Dock Layout',
    rank: 0
  });

  palette.addItem({
    command: 'earnings:open',
    category: 'Dock Layout',
    rank: 0
  });

  palette.addItem({
    command: 'news:open',
    category: 'Dock Layout',
    rank: 0
  });

  palette.addItem({
    command: 'peers:open',
    category: 'Dock Layout',
    rank: 0
  });

  palette.addItem({
    command: 'peerCorrelation:open',
    category: 'Dock Layout',
    rank: 0
  });

  palette.addItem({
    command: 'peerCorrelation:open',
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

  commands.addCommand('performance:open', {
    label: 'Open Performance',
    mnemonic: 2,
    iconClass: 'fa fa-plus',
    execute: () => {
      dock.addWidget(psps['chart']);
    }
  });

  commands.addCommand('quotes:open', {
    label: 'Open Quotes',
    mnemonic: 2,
    iconClass: 'fa fa-plus',
    execute: () => {
      dock.addWidget(psps['quote']);
    }
  });

  commands.addCommand('dividends:open', {
    label: 'Open Dividends',
    mnemonic: 2,
    iconClass: 'fa fa-plus',
    execute: () => {
      dock.addWidget(psps['dividends']);
    }
  });

  commands.addCommand('markets:open', {
    label: 'Open Markets',
    mnemonic: 2,
    iconClass: 'fa fa-plus',
    execute: () => {
      dock.addWidget(psps['markets']);
    }
  });

  commands.addCommand('cashflow:open', {
    label: 'Open Cashflow',
    mnemonic: 2,
    iconClass: 'fa fa-plus',
    execute: () => {
      dock.addWidget(psps['cashflow']);
    }
  });

  commands.addCommand('financials:open', {
    label: 'Open Financials',
    mnemonic: 2,
    iconClass: 'fa fa-plus',
    execute: () => {
      dock.addWidget(psps['financials']);
    }
  });

  commands.addCommand('stats:open', {
    label: 'Open Stats',
    mnemonic: 2,
    iconClass: 'fa fa-plus',
    execute: () => {
      dock.addWidget(tables['stats']);
    }
  });

  commands.addCommand('earnings:open', {
    label: 'Open Earnings',
    mnemonic: 2,
    iconClass: 'fa fa-plus',
    execute: () => {
      dock.addWidget(psps['earnings']);
    }
  });

  commands.addCommand('news:open', {
    label: 'Open News',
    mnemonic: 2,
    iconClass: 'fa fa-plus',
    execute: () => {
      dock.addWidget(tables['news']);
    }
  });

  commands.addCommand('peers:open', {
    label: 'Open Peers',
    mnemonic: 2,
    iconClass: 'fa fa-plus',
    execute: () => {
      dock.addWidget(psps['peers']);
    }
  });

  commands.addCommand('composition:open', {
    label: 'Open Composition',
    mnemonic: 2,
    iconClass: 'fa fa-plus',
    execute: () => {
      dock.addWidget(psps['composition']);
    }
  });

  /* hack for custom sizing */
  var layout = dock.saveLayout();
  var sizes: number[] = (layout.main as DockLayout.ISplitAreaConfig).sizes;
  sizes[0] = 0.6;
  sizes[1] = 0.4;
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

  setTimeout(()=>{ctrl.start()}, 500);
}


window.onload = main;




