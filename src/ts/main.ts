import {TabPanel, BoxPanel, DockPanel, DockLayout, MenuBar, Widget} from '@phosphor/widgets';

import {PerspectiveDataLoader, DataLoader} from './data';
import {Header} from './header';
import {showLoader, hideLoader} from './loader';

export
function main(): void {
  let main = new TabPanel();
  main.id = 'main';

  /* Title bar */
  let header = new Header();

  /* File bar */
  let bar = new MenuBar();
  bar.id = 'menuBar';

  let dock = new DockPanel();
  dock.id = 'dock';
  dock.title.label = 'Home';

  showLoader();
  hideLoader(1000);

  let daily = new PerspectiveDataLoader('Daily');
  dock.addWidget(daily);

  let cashflow = new PerspectiveDataLoader('Cashflow');
  dock.addWidget(cashflow, {mode: "split-bottom", ref: daily});

  let data = new DataLoader([daily], '/api/json/v1/data', {key: 'aapl', type: 'daily'})
  data.start();

  let data2 = new DataLoader([cashflow], '/api/json/v1/data', {key: 'aapl', type: 'cashflow'})
  data2.start();

  /* save/restore layouts */
  // let savedLayouts: DockPanel.ILayoutConfig[] = [];
  // savedLayouts.push(dock.saveLayout());
  
  /* hack for custom sizing */
  var layout = dock.saveLayout();
  var sizes: number[] = (layout.main as DockLayout.ISplitAreaConfig).sizes;
  sizes[0] = 0.75;
  sizes[1] = 0.25;
  dock.restoreLayout(layout);

  /* main area setup */
  BoxPanel.setStretch(dock, 1);

  main.addWidget(dock);

  window.onresize = () => { main.update(); };

  Widget.attach(header, document.body);
  Widget.attach(bar, document.body);
  Widget.attach(main, document.body);
}
  