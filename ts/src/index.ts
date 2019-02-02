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
  Header
} from './header';

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


  let dock = new DockPanel();
  dock.id = 'dock';


  /* Reference Data Tab */
  let refdata_panel = new SplitPanel();
  refdata_panel.title.label = 'Fundamentals';
  let stats_and_comp_panel = new BoxPanel({ direction: 'top-to-bottom', spacing: 0 });
  refdata_panel.addWidget(stats_and_comp_panel);

  /* Financials Tab */
  let financials_panel = new SplitPanel();
  let earnings_panel = new BoxPanel({ direction: 'top-to-bottom', spacing: 0 });
  financials_panel.title.label = 'Financials';
  financials_panel.addWidget(earnings_panel);

  /* Metrics Tab */
  let metrics_panel = new BoxPanel({ direction: 'top-to-bottom', spacing: 0 });
  metrics_panel.title.label = 'Calculations';

  /* Market Data Tab */
  let market_data_panel = new BoxPanel({ direction: 'top-to-bottom', spacing: 0 });
  market_data_panel.title.label = 'Market Data';

  /* Markets Info */
  dock.addWidget(refdata_panel);
  dock.addWidget(financials_panel, {mode: 'tab-after', ref: refdata_panel});

  /* save/restore layouts */
  let savedLayouts: DockPanel.ILayoutConfig[] = [];

  /* command palette */
  let palette = new CommandPalette({ commands });
  palette.id = 'palette';
  addCommands(palette);

  /* hack for custom sizing */
  savedLayouts.push(dock.saveLayout());

  /* main area setup */
  BoxPanel.setStretch(dock, 1);

  let home = new SplitPanel();
  home.id = 'home';
  home.title.label = 'Home';

  home.addWidget(dock);
  home.setRelativeSizes([.3, .7]);

  main.addWidget(home);
  main.addWidget(market_data_panel);
  main.addWidget(metrics_panel);

  window.onresize = () => { main.update(); };

  Widget.attach(header, document.body);
  Widget.attach(bar, document.body);
  Widget.attach(main, document.body);
}


window.onload = main;
