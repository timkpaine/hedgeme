/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/

import {
  CommandRegistry
} from '@phosphor/commands';

import {
  TabPanel, BoxPanel, DockPanel,  SplitPanel, CommandPalette, ContextMenu, MenuBar, Widget, Menu
} from '@phosphor/widgets';

import {
  PSPWidget
} from './perspective-widget';

import {
  TableWidget
} from './table';

import {
  Header
} from './header';

import {
  ControlsWidget
} from './controls';

import '../ts/style/index.css';

const commands = new CommandRegistry();

function addCommands(palette:CommandPalette){
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
    command: 'market-data:open',
    category: 'Dock Layout',
    rank: 0
  });

  palette.addItem({
    command: 'fundamentals:open',
    category: 'Dock Layout',
    rank: 0
  });

  palette.addItem({
    command: 'financials:open',
    category: 'Dock Layout',
    rank: 0
  });

  palette.addItem({
    command: 'metrics:open',
    category: 'Dock Layout',
    rank: 0
  });

  palette.addItem({
    command: 'markets:open',
    category: 'Dock Layout',
    rank: 0
  });
}


function main(): void {
  let main = new TabPanel();
  main.id = 'main';

  /* Data Menu */
  let menu = new Menu({ commands });
  menu.title.label = 'Layout';
  menu.title.mnemonic = 0;

  menu.addItem({ command: 'market-data:open'});
  menu.addItem({ type: 'separator'});
  menu.addItem({ command: 'fundamentals:open'});
  menu.addItem({ command: 'financials:open'});
  menu.addItem({ type: 'separator'});
  menu.addItem({ command: 'metrics:open'});
  menu.addItem({ type: 'separator'});
  menu.addItem({ command: 'markets:open' });
  menu.addItem({ type: 'separator'});
  menu.addItem({ command: 'save-dock-layout'});
  menu.addItem({ type: 'separator'});
  menu.addItem({ command: 'restore-dock-layout', args: {index: 0}});


  /* layouts menu */
  let menu2 = new Menu({ commands });
  menu2.title.label = 'Help';
  menu2.title.mnemonic = 0;

  /* Title bar */
  let header = new Header();

  /* File bar */
  let bar = new MenuBar();
  bar.addMenu(menu);
  bar.addMenu(menu2);
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
  markets.title.closable = false;
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

  let stats = new TableWidget('Stats');
  let news = new TableWidget('News');
  let tables = {'stats': stats,
                'news': news};

  let ctrl = new ControlsWidget('JPM', psps, tables);

  let dock = new DockPanel();
  dock.id = 'dock';


  /* Reference Data Tab */
  let refdata_panel = new SplitPanel();
  refdata_panel.title.label = 'Fundamentals';
  let stats_and_comp_panel = new BoxPanel({ direction: 'top-to-bottom', spacing: 0 });
  stats_and_comp_panel.addWidget(psps['composition']);
  stats_and_comp_panel.addWidget(news);
  refdata_panel.addWidget(stats);
  refdata_panel.addWidget(stats_and_comp_panel);

  /* Financials Tab */
  let financials_panel = new SplitPanel();
  let earnings_panel = new BoxPanel({ direction: 'top-to-bottom', spacing: 0 });
  financials_panel.title.label = 'Financials';
  earnings_panel.addWidget(psps['financials']);
  earnings_panel.addWidget(psps['earnings']);
  earnings_panel.addWidget(psps['dividends']);
  financials_panel.addWidget(psps['cashflow']);
  financials_panel.addWidget(earnings_panel);

  /* Metrics Tab */
  let metrics_panel = new BoxPanel({ direction: 'top-to-bottom', spacing: 0 });
  metrics_panel.title.label = 'Calculations';
  metrics_panel.addWidget(psps['peerCorrelation']);
  metrics_panel.addWidget(psps['peers']);

  /* Market Data Tab */
  let market_data_panel = new BoxPanel({ direction: 'top-to-bottom', spacing: 0 });
  market_data_panel.title.label = 'Market Data';
  market_data_panel.addWidget(psps['chart']);
  market_data_panel.addWidget(psps['quote']);

  /* Markets Info */
  dock.addWidget(refdata_panel);
  dock.addWidget(financials_panel, {mode: 'tab-after', ref: refdata_panel});



  /* save/restore layouts */
  let savedLayouts: DockPanel.ILayoutConfig[] = [];

  /* command palette */
  let palette = new CommandPalette({ commands });
  palette.id = 'palette';
  addCommands(palette);

  /* command registry */
  // commands.addCommand('save-dock-layout', {
  //   label: 'Save Layout',
  //   caption: 'Save the current dock layout',
  //   execute: () => {
  //     savedLayouts.push(dock.saveLayout());
  //     palette.addItem({
  //       command: 'restore-dock-layout',
  //       category: 'Dock Layout',
  //       args: { index: savedLayouts.length - 1 }
  //     });
  //     menu2.addItem({ command: 'restore-dock-layout', args: {index: savedLayouts.length - 1}});
  //   }
  // });

  // commands.addCommand('restore-dock-layout', {
  //   label: args => {
  //     return `Restore Layout ${args.index as number}`;
  //   },
  //   execute: args => {
  //     dock.restoreLayout(savedLayouts[args.index as number]);
  //   }
  // });

  // commands.addCommand('controls:open', {
  //   label: 'Controls',
  //   mnemonic: 1,
  //   iconClass: 'fa fa-plus',
  //   execute: () => {
  //     dock.restoreLayout(savedLayouts[0]);
  //   }
  // });

  // commands.addCommand('market-data:open', {
  //   label: 'Open Market Data',
  //   mnemonic: 2,
  //   iconClass: 'fa fa-plus',
  //   execute: () => {
  //     main.addWidget(market_data_panel);
  //   }
  // });


  // commands.addCommand('fundamentals:open', {
  //   label: 'Open Fundamentals Data',
  //   mnemonic: 2,
  //   iconClass: 'fa fa-plus',
  //   execute: () => {
  //     dock.addWidget(refdata_panel);
  //   }
  // });

  // commands.addCommand('financials:open', {
  //   label: 'Open Financials Data',
  //   mnemonic: 2,
  //   iconClass: 'fa fa-plus',
  //   execute: () => {
  //     dock.addWidget(financials_panel);
  //   }
  // });

  // commands.addCommand('metrics:open', {
  //   label: 'Open Calculations Data',
  //   mnemonic: 2,
  //   iconClass: 'fa fa-plus',
  //   execute: () => {
  //     main.addWidget(metrics_panel);
  //   }
  // });

  // commands.addCommand('markets:open', {
  //   label: 'Open Markets',
  //   mnemonic: 2,
  //   iconClass: 'fa fa-plus',
  //   execute: () => {
  //     main.addWidget(psps['markets']);
  //   }
  // });

  /* hack for custom sizing */
  // var layout = dock.saveLayout();
  // var sizes: number[] = (layout.main as DockLayout.ISplitAreaConfig).sizes;
  // sizes[0] = 0.6;
  // sizes[1] = 0.4;
  // dock.restoreLayout(layout);
  savedLayouts.push(dock.saveLayout());
  // palette.addItem({
  //   command: 'restore-dock-layout',
  //   category: 'Dock Layout',
  //   args: { index: 0}
  // });

  /* main area setup */
  BoxPanel.setStretch(dock, 1);

  let home = new SplitPanel();
  home.id = 'home';
  home.title.label = 'Home';

  home.addWidget(ctrl);
  home.addWidget(dock);
  home.setRelativeSizes([.3, .7]);

  main.addWidget(home);
  main.addWidget(market_data_panel);
  main.addWidget(metrics_panel);
  main.addWidget(psps['markets']);

  window.onresize = () => { main.update(); };

  Widget.attach(header, document.body);
  Widget.attach(bar, document.body);
  Widget.attach(main, document.body);

  setTimeout(()=>{ctrl.start()}, 500);

  console.log('test');
  console.log('test');
  console.log('test');
  console.log('test');
  console.log('test');
  console.log('test');
  console.log('test');
  console.log('test');
  console.log('test');
  console.log('test');
  console.log('test');
  console.log('test');
  console.log('test');
  console.log('test');
  console.log('test');
  console.log('test');
}


window.onload = main;
