import {
  TabPanel, BoxPanel, DockPanel,  SplitPanel, MenuBar, Widget
} from '@phosphor/widgets';

import {Header} from './header';

import '../ts/style/index.css';
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

  showLoader();
  hideLoader(1000);

  /* Reference Data Tab */
  let refdata_panel = new SplitPanel();
  refdata_panel.title.label = 'Fundamentals';
  let stats_and_comp_panel = new BoxPanel({ direction: 'top-to-bottom', spacing: 0 });
  refdata_panel.addWidget(stats_and_comp_panel);

  /* Markets Info */
  dock.addWidget(refdata_panel);

  /* save/restore layouts */
  let savedLayouts: DockPanel.ILayoutConfig[] = [];

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

  window.onresize = () => { main.update(); };

  Widget.attach(header, document.body);
  Widget.attach(bar, document.body);
  Widget.attach(main, document.body);
}
