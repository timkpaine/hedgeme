import {BoxPanel, DockLayout, DockPanel, MenuBar, TabPanel, Widget} from "@phosphor/widgets";

import {DataLoader, PerspectiveDataLoader} from "./data";
import {Header} from "./header";
import {hideLoader, showLoader} from "./loader";

export
function main(): void {
  // tslint:disable-next-line: no-shadowed-variable
  const main = new TabPanel();
  main.id = "main";

  /* Title bar */
  const header = new Header();

  /* File bar */
  const bar = new MenuBar();
  bar.id = "menuBar";

  const dock = new DockPanel();
  dock.id = "dock";
  dock.title.label = "Home";

  showLoader();
  hideLoader(1000);

  const daily = new PerspectiveDataLoader("Daily");
  dock.addWidget(daily);

  const cashflow = new PerspectiveDataLoader("Cashflow");
  dock.addWidget(cashflow, {mode: "split-bottom", ref: daily});

  const data = new DataLoader([daily], "/api/json/v1/data", {key: "aapl", type: "daily"});
  data.start();

  const data2 = new DataLoader([cashflow], "/api/json/v1/data", {key: "aapl", type: "cashflow"});
  data2.start();

  /* save/restore layouts */
  // let savedLayouts: DockPanel.ILayoutConfig[] = [];
  // savedLayouts.push(dock.saveLayout());

  /* hack for custom sizing */
  const layout = dock.saveLayout();
  const sizes: number[] = (layout.main as DockLayout.ISplitAreaConfig).sizes;
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
