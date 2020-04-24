import { createStore, createEvent, combine, sample } from "effector";
import { h, spec, remap, list, using } from "effector-dom";

function random(max) {
  return Math.round(Math.random() * 1000) % max;
}

const A = [
  "pretty",
  "large",
  "big",
  "small",
  "tall",
  "short",
  "long",
  "handsome",
  "plain",
  "quaint",
  "clean",
  "elegant",
  "easy",
  "angry",
  "crazy",
  "helpful",
  "mushy",
  "odd",
  "unsightly",
  "adorable",
  "important",
  "inexpensive",
  "cheap",
  "expensive",
  "fancy",
];
const C = [
  "red",
  "yellow",
  "blue",
  "green",
  "pink",
  "brown",
  "purple",
  "brown",
  "white",
  "black",
  "orange",
];
const N = [
  "table",
  "chair",
  "house",
  "bbq",
  "desk",
  "car",
  "pony",
  "cookie",
  "sandwich",
  "burger",
  "pizza",
  "mouse",
  "keyboard",
];

let nextId = 1;

function buildData(count) {
  const data = new Array(count);
  for (let i = 0; i < count; i++) {
    data[i] = {
      id: nextId++,
      label: `${A[random(A.length)]} ${C[random(C.length)]} ${
        N[random(N.length)]
      }`,
    };
  }
  return data;
}

function GlyphIcon() {
  h("span", {
    attr: {
      class: "glyphicon glyphicon-remove",
      "aria-hidden": "true",
    },
  });
}

function Row({ $selected, $item, onSelect, onRemove }) {
  const $dangerClass = $selected.map((is) => (is ? "danger" : ""));
  const $id = remap($item, "id");
  const $label = remap($item, "label");

  h("tr", () => {
    spec({ attr: { class: $dangerClass } });
    h("td", { attr: { class: "col-md-1" }, text: $id });
    h("td", () => {
      spec({ attr: { class: "col-md-4" } });
      h("a", { handler: { click: onSelect }, text: $label });
    });
    h("td", () => {
      spec({ attr: { class: "col-md-1" } });
      h("a", () => {
        spec({ handler: { click: onRemove } });
        GlyphIcon();
      });
    });
    h("td", { attr: { class: "col-md-6" } });
  });
}

function Button({ id, click, title }) {
  h("div", () => {
    spec({ attr: { class: "col-sm-6 smallpag" } });
    h("button", {
      attr: {
        type: "button",
        class: "btn btn-primary btn-block",
        id,
      },
      handler: { click },
      text: title,
    });
  });
}

function Jumbotron({ onRun, onRunLots, onAdd, onUpdate, onClear, onSwapRows }) {
  h("div", () => {
    spec({ attr: { class: "jumbotron" } });

    h("div", () => {
      spec({ attr: { class: "row" } });

      h("div", () => {
        spec({ attr: { class: "col-md-6" } });

        h("h1", { text: "effector-dom keyed" });
      });

      h("div", () => {
        spec({ attr: { class: "col-md-6" } });

        h("div", () => {
          spec({ attr: { class: "row" } });

          Button({ id: "run", title: "Create 1,000 rows", click: onRun });
          Button({
            id: "runlots",
            title: "Create 10,000 rows",
            click: onRunLots,
          });
          Button({ id: "add", title: "Append 1,000 rows", click: onAdd });
          Button({
            id: "update",
            title: "Update every 10th row",
            click: onUpdate,
          });
          Button({ id: "clear", title: "Clear", click: onClear });
          Button({ id: "swaprows", title: "Swap Rows", click: onSwapRows });
        });
      });
    });
  });
}

function Main() {
  const $data = createStore([]);
  const $selected = createStore(0);

  const run = createEvent();
  const runLots = createEvent();
  const add = createEvent();
  const update = createEvent();
  const select = createEvent(); // item
  const remove = createEvent(); // item
  const clear = createEvent();
  const swapRows = createEvent();

  $data
    .on(run, () => buildData(1000))
    .on(runLots, () => buildData(10000))
    .on(add, (list) => list.concat(buildData(1000)))
    .on(update, (list) => {
      const data = list.concat([]); // to change ref to arrays
      for (let i = 0; i < data.length; i += 10) {
        const item = data[i];
        data[i] = { id: item.id, label: item.label + " !!!" };
      }
      return data;
    })
    .on(remove, (list, item) => {
      const data = list.concat([]); // to change ref
      data.splice(data.indexOf(item), 1);
      return data;
    })
    .on(clear, () => [])
    .on(swapRows, (list) => {
      const data = list.concat([]); // to change ref
      if (data.length > 998) {
        let temp = data[1];
        data[1] = data[998];
        data[998] = temp;
      }
      return data;
    });

  // @ts-ignore
  $selected.on(select, (_, item) => item.id).on(clear, () => 0);

  h("div", () => {
    spec({ attr: { class: "container" } });

    Jumbotron({
      onRun: run,
      onRunLots: runLots,
      onAdd: add,
      onUpdate: update,
      onClear: clear,
      onSwapRows: swapRows,
    });

    h("table", () => {
      spec({ attr: { class: "table table-hover table-striped test-data" } });

      h("tbody", () => {
        list($data, ({ store }) => {
          const $isSelected = combine(
            store,
            $selected,
            (item, selected) => item.id === selected
          );
          const clickRemove = createEvent();
          const clickSelect = createEvent();

          sample({
            source: store,
            clock: clickRemove,
            target: remove,
          });
          sample({
            source: store,
            clock: clickSelect,
            target: select,
          });

          Row({
            $selected: $isSelected,
            $item: store,
            onRemove: clickRemove,
            onSelect: clickSelect,
          });
        });
      });
    });
  });
}

using(document.getElementById("main"), Main);
