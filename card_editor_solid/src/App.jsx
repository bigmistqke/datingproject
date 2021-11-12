import ImageUploader from "./managers/ImageUploader";
import "./App.css";

import uniqid from "uniqid";

import { createEffect, For, createMemo, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { useParams } from "solid-app-router";

import { HierarchyList, HierarchyElement } from "./components/panels/Hierarchy";

import CardComposition from "./components/card/CardComposition";
import CardMask from "./components/card/CardMask";

import LayOut from "./components/panels/LayOut";
import TextStyling from "./components/panels/TextStyling";
import SVGStyling from "./components/panels/SVGStyling";

import HighlightStyling from "./components/panels/HighlightStyling";
import BackgroundPanel from "./components/panels/BackgroundPanel";

import Guides from "./components/viewport/Guides";
import Rulers from "./components/viewport/Rulers";
import Swatches from "./components/panels/Swatches";
import MaskHandle from "./components/viewport/MaskHandle";

import Prompt from "./components/Prompt";

import { array_move, array_remove } from "./helpers/Pure";

import { styled } from "solid-styled-components";

import {
  HeaderPanel,
  LabeledInput,
  FlexRow,
  GridRow,
  Label,
  Button,
  Span,
  LabeledColorPicker,
  FullScreen,
  Overlay,
} from "./components/panels/UI_Components";

function App(props) {
  const { card_id } = useParams();

  const default_types = ["do", "say", "back"];

  let card_ref;

  const getDefaultTextState = () => ({
    position: {
      x: 10,
      y: 12,
    },
    dimensions: {
      width: 80,
      height: 80,
    },
    styles: {
      family: "times",
      size: 10,
      lineHeight: 12,
      spacing: 0,
      color: 0,
      alignmentHorizontal: "flex-start",
      alignmentVertical: "flex-start",
      shadowLeft: 0,
      shadowTop: 0,
      shadowBox: 0,
    },
  });

  const getDefaultVisibilities = () => [
    { type: "choice", visible: 1 },
    { type: "timed", visible: 1 },
  ];

  const [state, setState] = createStore({
    pressed_keys: [],
    bools: {
      shouldSnap: false,
      isShiftPressed: false,
      isAltPressed: false,
      areGuidesLocked: false,
      areGuidesHidden: false,
    },
    guides: [],
    deck: {
      background: "#efefef",
      border_radius: "5",
      card_dimensions: {
        width: 55.88507940957915,
        height: 100,
      },
      elements: {},
      instruction: {
        ...getDefaultTextState(),
        highlight_styles: {
          family: "times",
          color: 2,
          background: 0,
          alignmentHorizontal: "right",
          marginHorizontal: 5,
          marginVertical: 5,
          paddingHorizontal: 5,
          paddingVertical: 5,
          alignmentVertical: "flex-start",
          borderRadius: 0,
          borderWidth: 0,
          borderColor: 0,
          textShadowLeft: 0,
          textShadowTop: 0,
          textShadowBox: 0,
          boxShadowLeft: 0,
          boxShadowTop: 0,
          boxShadowBox: 0,
        },
      },
      countdown: {
        visibilities: [
          { type: "default", visible: false },
          { type: "choice", visible: false },
          { type: "timed", visible: true },
        ],
        position: {
          x: 25,
          y: 90,
        },
        dimensions: {
          width: 50,
          height: 10,
        },
        styles: {
          family: "times",
          size: 10,
          lineHeight: 12,
          spacing: 0,
          color: 0,
          alignmentHorizontal: "center",
          alignmentVertical: "center",
          shadowLeft: 0,
          shadowTop: 0,
          shadowBox: 0,
        },
      },
      designs: {},
    },
    viewport: {
      masked_percentage: 90,
      masked_styling: false,
      selected_element_index: false,
      type_manager: false,
      card_selected: {
        type: "do",
        timed: false,
        choice: false,
      },
      prompt: false,
      card_size: {},
    },
  });

  const lorem_ipsum = {
    normal: [
      "A week ago, when I returned home from doing my weekly groceries, I passed a theatre, ...",
      "For a minute, I lost myself.",
      "but as a traveler, or rather a philosopher.” Well, long story short: I had a chat with this man, ",
      "I know. This heatwave has me sweating like a pig in a butchers shop.",
    ],
    choice: [
      "That boat is taking [cocaine / vaccines / refugees / Coca cola] to [Antwerp / Rotterdam / the UK / Calais]",
      "I [ would / would not ] want to live there, because [ ... ]",
      "I think that [death / paradise / hope / suffering / redemption] is waiting for us over there.",
      "And that one is taking [4x4 cars / ayuhuasca / underpaid workers / cows and pigs] to Dubai.",
    ],
  };

  // state getters and setters

  //    viewport

  const toggleMaskedStyling = (e) => {
    e.stopPropagation();
    setState("viewport", "masked_styling", (bool) => !bool);
  };

  const setMaskPercentage = (percentage) => {
    setState("viewport", "masked_percentage", percentage);
  };

  const toggleTypeManager = async () => {
    setState("viewport", "type_manager", (bool) => !bool);
    /*   const result = await props.openPrompt({
      type: "type_manager",
      position: center,
      data: {
        options: ["delete", "fill", "fill horizontally", "fill vertically"],
      },
    });

    if (!result) return; */
  };

  //  set card modes

  const setChoice = (bool) => {
    setState("viewport", "card_selected", "choice", bool);
    changeInstructionText();
  };

  const setTimed = (bool) => {
    setState("viewport", "card_selected", "timed", bool);
    changeInstructionText();
  };

  //   deck

  //   deck: general

  const getCardSize = () => ({
    height: window.innerHeight * 0.9,
    width:
      (window.innerHeight * 0.9 * state.deck.card_dimensions.width) /
      state.deck.card_dimensions.height,
  });

  const setCardDimension = (dimension, value) => {
    setState("deck", "card_dimensions", dimension, value);
  };

  const setBackground = (background) =>
    setState("deck", "background", background);

  //   deck: instruction

  const getInstruction = () =>
    getSelectedType()
      ? getSelectedType().elements.find(
          (element) => element.type === "instruction"
        )
      : null;

  const getInstructionAsArguments = () => {
    let instruction_index = getSelectedType().elements.findIndex(
      (element) => element.type === "instruction"
    );
    return [...getSelectedTypeAsArguments(), "elements", instruction_index];
  };

  const getInstructionStyles = () =>
    getInstruction()
      ? {
          ...state.deck.instruction.styles,
          ...getInstruction().styles,
        }
      : null;

  const setStyleInstruction = ({ type, value }) => {
    if (type === "color") {
      setState(...getInstructionAsArguments(), "styles", type, value);
    } else {
      setState("deck", "instruction", "styles", type, value);
    }
  };

  const translateInstruction = (delta) => {
    setState("deck", "instruction", "position", (position) => ({
      x: position.x + (delta.x / getCardSize().width) * 100,
      y: position.y + (delta.y / getCardSize().height) * 100,
    }));
  };

  const resizeInstruction = ({ position, dimensions }) => {
    setState("deck", "instruction", "position", position);
    setState("deck", "instruction", "dimensions", dimensions);
  };

  const changeInstructionText = async () => {
    let type = state.viewport.card_selected.choice ? "choice" : "normal";
    let current_text = getInstruction().content;

    const getRandomLoremIpsum = () =>
      new Promise((resolve) => {
        const findRandomLoremIpsum = () => {
          let random_index = Math.floor(
            Math.random() * lorem_ipsum[type].length
          );
          let random_lorem_ipsum = lorem_ipsum[type][random_index];
          if (random_lorem_ipsum !== current_text) resolve(random_lorem_ipsum);
          else findRandomLoremIpsum();
        };
        findRandomLoremIpsum();
      });

    let random_lorem_ipsum = await getRandomLoremIpsum();

    setState(
      ...getSelectedTypeAsArguments(),
      "elements",
      (element) => element.type === "instruction",
      "content",
      random_lorem_ipsum
    );
  };

  const getHighlightStyles = () =>
    getInstruction()
      ? {
          ...state.deck.instruction.highlight_styles,
          ...getInstruction().highlight_styles,
        }
      : null;

  const setHighlightStyle = ({ type, value }) => {
    if (type === "background" || type === "color") {
      setState(...getInstructionAsArguments(), "highlight_styles", type, value);
    } else {
      setState("deck", "instruction", "highlight_styles", type, value);
    }
  };

  //   deck: countdown

  const getCountdown = () =>
    getSelectedType()
      ? getSelectedType().elements.find(
          (element) => element && element.type === "countdown"
        )
      : null;

  const getCountdownAsArguments = () => {
    let instruction_index = getSelectedType().elements.findIndex(
      (element) => element.type === "countdown"
    );
    return [...getSelectedTypeAsArguments(), "elements", instruction_index];
  };
  const getCountdownStyles = () =>
    getInstruction()
      ? {
          ...state.deck.countdown.styles,
          ...getCountdown().styles,
        }
      : null;

  const getCountdownDimensions = () => state.deck.countdown.dimensions;
  const getCountdownPosition = () => state.deck.countdown.position;

  const translateCountdown = (delta) => {
    setState("deck", "countdown", "position", (position) => ({
      x: position.x + (delta.x / getCardSize().width) * 100,
      y: position.y + (delta.y / getCardSize().height) * 100,
    }));
  };
  const resizeCountdown = ({ position, dimensions }) => {
    setState("deck", "countdown", "position", position);
    setState("deck", "countdown", "dimensions", dimensions);
  };
  const setCountdownStyle = ({ type, value }) => {
    if (type === "color") {
      setState(...getCountdownAsArguments(), "styles", type, value);
    } else {
      setState("deck", "countdown", "styles", type, value);
    }
  };

  //  deck: type

  const setType = (type) => setState("viewport", "card_selected", "type", type);

  const isTypeSelected = (type) => {
    return state.viewport.card_selected.type === type;
  };

  const getSelectedType = () => {
    let selected_type = state.deck.designs[state.viewport.card_selected.type];

    if (!selected_type) return undefined;

    return selected_type;
  };

  const getSelectedTypeAsArguments = createMemo(() => {
    return ["deck", "designs", state.viewport.card_selected.type];
  });

  //  deck: type: swatches

  const getSelectedSwatches = (timed = false) => {
    let selected_design = getSelectedType();
    if (!selected_design) return [];

    return selected_design.swatches.map((s) => (timed ? s.timed : s.normal));
  };

  const setSwatch = (index, color) => {
    setState(
      "deck",
      "designs",
      state.viewport.card_selected.type,
      "swatches",
      index,
      !state.viewport.masked_styling ? "normal" : "timed",
      color
    );
  };

  const addSwatch = (index, color) => {
    setState(
      "deck",
      "designs",
      state.viewport.card_selected.type,
      "swatches",
      state.deck.designs[state.viewport.card_selected.type].swatches.length,
      {
        normal: "#000000",
        timed: "#ffffff",
      }
    );
  };

  //      deck: type: elements

  const setSelectedElementIndex = (index) => {
    setState("viewport", "selected_element_index", index);
  };

  const getElement = (index) => getSelectedType().elements[index];

  const getElementAsArguments = (index) => {
    return [...getSelectedTypeAsArguments(), "elements", index];
  };

  const getElementsOfSelectedType = (from_where) => {
    let selected_design = getSelectedType();
    if (!selected_design) return [];

    return selected_design.elements;
  };

  const getSelectedElement = createMemo(() => {
    if (
      state.viewport.selected_element_index !== 0 &&
      !state.viewport.selected_element_index
    ) {
      return false;
    }
    let selected_design = getSelectedType();
    if (!selected_design) return false;
    return selected_design.elements[state.viewport.selected_element_index];
  });

  const selectedElementIsType = (type) =>
    getSelectedElement() &&
    getSelectedElement().type &&
    getSelectedElement().type.indexOf(type) != -1;

  const elementIsVisible = (element) => {
    // different possible states

    // when choice -> showcase once with choice, else do not
    // when timer -> showcase if with timer, else do not
    // if no timer neither choice -> check if default

    // NO TIMER — NO CHOICE
    if (
      !state.viewport.card_selected.timed &&
      !state.viewport.card_selected.choice
    ) {
      console.log(element.type);
      if (
        (element.visibilities.find((v) => v.type === "choice").visible === 1 ||
          element.visibilities.find((v) => v.type === "choice").visible ===
            0) &&
        (element.visibilities.find((v) => v.type === "timed").visible === 1 ||
          element.visibilities.find((v) => v.type === "timed").visible === 0)
      ) {
        console.log(element.type + " is visible");

        return true;
      } else {
        return false;
      }
    }

    // YES TIMER — NO CHOICE
    if (
      state.viewport.card_selected.timed &&
      !state.viewport.card_selected.choice
    ) {
      if (
        (element.visibilities.find((v) => v.type === "timed").visible === 1 ||
          element.visibilities.find((v) => v.type === "timed").visible === 2) &&
        (element.visibilities.find((v) => v.type === "choice").visible === 1 ||
          element.visibilities.find((v) => v.type === "choice").visible === 0)
      ) {
        return true;
      }
    }

    // NO TIMER — YES CHOICE
    if (
      !state.viewport.card_selected.timed &&
      state.viewport.card_selected.choice
    ) {
      if (
        (element.visibilities.find((v) => v.type === "timed").visible === 1 ||
          element.visibilities.find((v) => v.type === "timed").visible === 0) &&
        (element.visibilities.find((v) => v.type === "choice").visible === 1 ||
          element.visibilities.find((v) => v.type === "choice").visible === 2)
      ) {
        return true;
      }
    }

    // YES TIMER — YES CHOICE
    if (
      state.viewport.card_selected.timed &&
      state.viewport.card_selected.choice
    ) {
      if (
        (element.visibilities.find((v) => v.type === "timed").visible === 1 ||
          element.visibilities.find((v) => v.type === "timed").visible === 2) &&
        (element.visibilities.find((v) => v.type === "choice").visible === 1 ||
          element.visibilities.find((v) => v.type === "choice").visible === 2)
      ) {
        return true;
      }
    }

    return false;
  };

  const translateElement = ({ index, delta }) => {
    setState(...getElementAsArguments(index), "position", (position) => ({
      x: position.x + (delta.x / getCardSize().width) * 100,
      y: position.y + (delta.y / getCardSize().height) * 100,
    }));
  };

  const setLockedElement = (index, bool) => {
    if (state.viewport.selected_element_index === index && bool)
      setSelectedElementIndex(false);
    if (!bool) setSelectedElementIndex(index);
    setState(...getElementAsArguments(index), "locked", bool);
  };

  const removeElement = (index) => {
    setState(
      ...getSelectedTypeAsArguments(),
      "elements",
      array_remove(getElementsOfSelectedType(), index)
    );
  };

  const changeOrderElement = (from_index, to_index) => {
    setState(
      ...getSelectedTypeAsArguments(),
      "elements",
      array_move(getElementsOfSelectedType(), from_index, to_index)
    );
    setSelectedElementIndex(to_index);
  };

  const toggleVisibilityElement = (index, type) => {
    setState(
      ...getElementAsArguments(index),
      "visibilities",
      (visibility) => visibility.type === type,
      "visible",
      (visibility_mode) => (visibility_mode + 1) % 3
    );
  };

  const resizeElement = ({ index, dimensions, position }) => {
    setState(...getElementAsArguments(index), "position", position);
    setState(...getElementAsArguments(index), "dimensions", dimensions);
  };

  const setStyleElement = ({ index, type, value }) => {
    setState(...getElementAsArguments(index), "styles", type, value);
  };

  const processSVG = async (file) => {
    const findStyle = (svg) =>
      new Promise((resolve) => {
        const iterate = (el) => {
          if (!el.children) return;
          [...el.children].forEach((el) => {
            if (el.localName === "style") {
              resolve(el.childNodes[0].data);
            } else {
              iterate(el.children);
            }
          });
        };
        iterate(svg);
        resolve(false);
      });

    const container = document.createElement("div");
    container.innerHTML = file.result;
    let svg_dom = container.children[0];

    const style_text = await findStyle(svg_dom);
    if (!style_text) {
      console.error("could not find style");
      return;
    }

    let duplicate_check = [];
    let styles = style_text
      .match(/\.[^{,]+/gs)
      .map((c) => c.slice(1, c.length))
      .filter((c) => {
        if (duplicate_check.indexOf(c) != -1) return false;
        duplicate_check.push(c);
        return true;
      })
      .map((c) => ({ old_name: c }));

    styles = styles.map((c) => {
      let regex = new RegExp(c.old_name + "(?![0-9])[^{]*[^}]*", "g");
      let style = {};
      [...style_text.matchAll(regex)].forEach((string) => {
        string = string[0].split("{")[1];
        let split_string = string.split(";");
        split_string.forEach((key_value) => {
          const [key, value] = key_value.split(":");
          if (!key || !value) return;
          style[key] = value;
        });
      });
      return { ...c, new_name: uniqid(), style };
    });

    // let renamed_svg = file.result;
    let svg = file.result;

    styles.forEach((s) => {
      let regex = `${s.old_name}(?![0-9])`;
      svg = svg.replace(new RegExp(regex, "g"), s.new_name);
    });

    styles = Object.fromEntries(styles.map((s) => [s.new_name, s.style]));

    return { svg, styles };
  };

  // window.setState = setState;

  const setStyleSVG = ({ key, type, value }) => {
    setState(
      ...getElementAsArguments(state.viewport.selected_element_index),
      "styles",
      key,
      type,
      value
    );
  };

  // general functions

  const fetchDeck = async (card_id) => {
    try {
      let result = await fetch(`${props.urls.fetch}/api/card/get/${card_id}`);
      let deck = await result.json();
      if (!deck) return false;
      setState("deck", deck);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const saveDeck = async () => {
    try {
      let result = await fetch(`${props.urls.fetch}/api/card/save/${card_id}`, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(state.deck),
      });
      result = await result.json();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const upload = (e) => {
    e.preventDefault();
    e.preventDefault();

    const file = e.dataTransfer.files[0];

    if (!(file && file["type"].split("/")[0] === "image")) return;

    if (!file) return;
    const reader = new FileReader();
    const splitted_name = file.name.split(".");
    const file_is_svg =
      splitted_name[splitted_name.length - 1].toLowerCase() === "svg";

    reader.onload = async function ({ target }) {
      if (file_is_svg) {
        const { svg, styles } = await processSVG(target);

        setState(...getElementAsArguments(getSelectedType().elements.length), {
          type: "svg",
          visibilities: getDefaultVisibilities(),
          position: {
            x: 0,
            y: 0,
          },
          dimensions: {
            width: 100,
            height: 100,
          },
          svg,
          styles,
          content: splitted_name.slice(0, splitted_name.length - 1).join("."),
        });
      }
    };
    if (!file_is_svg) reader.readAsDataURL(file);
    else reader.readAsText(file);
  };

  //    styled components

  const LongPanel = styled("div")`
    bottom: 0px;
    right: 0px;
    background: white;
    text-align: left;
    z-index: 5;
    text-align: left;
    font-size: 8pt;
    /* width: 250px; */
    /* height: 100vh; */
    overflow: hidden;
    flex-direction: column;
    border-left: 3px solid white;
    display: flex;
    & * {
      font-size: 8pt;
    }
  `;
  const BottomPanel = styled("div")`
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 0px;
    width: 100%;
  `;

  const App = styled("div")`
    text-align: center;
    height: 100vh;
    width: 100vw;
    position: absolute;
    overflow: hidden;
    flex-direction: row;
    /* background: lightgrey; */
    display: flex;
    flex: 1;
  `;

  const CardContainer = styled("div")`
    position: absolute;
    transform: translate(-50%, -50%);
    position: relative;
    left: 50%;
    top: 50%;
    background: white;
    box-shadow: 0px 0px 50px lightgrey;
    z-index: 5;
  `;

  const Viewport = styled("div")`
    flex: 1;
    position: relative;
  `;

  //

  const createNewCard = () => {
    let designs = Object.fromEntries(
      default_types.map((type) => [
        type,
        {
          swatches: [
            { normal: "#000000", timed: "#ffffff" },
            { normal: "#CCCCCC", timed: "#CCCCCC" },
            { normal: "#ffffff", timed: "#000000" },
          ],
          elements:
            type !== "back"
              ? [
                  {
                    type: "instruction",
                    visibilities: getDefaultVisibilities(),
                    styles: {
                      color: 0,
                    },
                    highlight_styles: {
                      background: 1,
                    },
                    content:
                      lorem_ipsum["normal"][
                        Math.floor(Math.random() * lorem_ipsum["normal"].length)
                      ],
                  },
                  {
                    type: "countdown",
                    visibilities: [
                      { type: "choice", visible: 1 },
                      { type: "timed", visible: 2 },
                    ],
                    styles: {
                      color: 0,
                    },
                    content: 30 * (state.viewport.masked_percentage / 100),
                  },
                ]
              : [],
        },
      ])
    );

    setState("deck", "designs", designs);
  };

  const openPrompt = ({ type, data, position }) =>
    new Promise((_resolve) => {
      const resolve = (data) => {
        setState("viewport", "prompt", false);
        _resolve(data);
      };

      setState("viewport", "prompt", {
        type,
        data,
        position,
        resolve,
      });
    });

  onMount(async () => {
    window.addEventListener("resize", () => {
      setState("viewport", "card_size", getCardSize());
    });
    setState("viewport", "card_size", getCardSize());
    let result = await fetchDeck(card_id);
    if (result) return;
    createNewCard();
  });

  return (
    <>
      <Show when={state.viewport.type_manager}>
        <FullScreen
          className="prompt_container"
          onMouseDown={(e) =>
            e.target.classList.contains("type_manager")
              ? toggleTypeManager
              : null
          }
        >
          <Overlay
            style={{
              left: "50%",
              top: "50%",
              width: "200px",
              transform: "translate(-50%,-50%)",
            }}
          >
            <HeaderPanel
              label="Type Manager"
              extra={<Button>add new type</Button>}
              always_visible={true}
            >
              <FlexRow>
                <For each={Object.keys(state.deck.designs)}>
                  {(type) => (
                    <Span contenteditable style={{ flex: 1 }}>
                      {type}
                    </Span>
                  )}
                </For>
              </FlexRow>
            </HeaderPanel>
          </Overlay>
        </FullScreen>
      </Show>
      <App
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => e.preventDefault()}
        onDrop={upload}
        style={{ background: state.deck.background }}
      >
        <Show when={state.viewport.prompt}>
          <Prompt
            type={state.viewport.prompt.type}
            data={state.viewport.prompt.data}
            position={state.viewport.prompt.position}
            resolve={state.viewport.prompt.resolve}
          ></Prompt>
        </Show>
        <Viewport
          className="viewport"
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => e.preventDefault()}
          onMouseDown={(e) =>
            e.buttons === 0 ? setSelectedElementIndex(false) : null
          }
        >
          <Rulers
            card_dim={state.deck.card_dimensions}
            guides={state.guides}
            shouldSnap={state.bools.shouldSnap}
          ></Rulers>
          <Show when={state.viewport.card_selected.timed}>
            <MaskHandle
              percentage={state.viewport.masked_percentage}
              onTranslate={setMaskPercentage}
            ></MaskHandle>
          </Show>

          <CardContainer
            card_dimensions={JSON.stringify(state.deck.card_dimensions)}
            ref={card_ref}
            style={{
              width: `calc(90vh * ${
                state.deck.card_dimensions.width /
                state.deck.card_dimensions.height
              })`,
              height: "90vh",
              "border-radius": state.deck.border_radius * 0.9 + "vh",
            }}
          >
            <div className="viewport">
              <CardComposition
                elements={getElementsOfSelectedType("card")}
                swatches={getSelectedSwatches()}
                //
                card_dimensions={state.deck.card_dimensions}
                card_size={state.viewport.card_size}
                guides={state.guides}
                shouldSnap={state.bools.shouldSnap}
                shiftPressed={state.bools.isShiftPressed}
                altPressed={state.bools.isAltPressed}
                //
                elementIsVisible={elementIsVisible}
                //
                selected_element_index={state.viewport.selected_element_index}
                selectElement={setSelectedElementIndex}
                //
                translateInstruction={translateInstruction}
                resizeInstruction={resizeInstruction}
                //
                translateCountdown={translateCountdown}
                resizeCountdown={resizeCountdown}
                //
                translateElement={translateElement}
                resizeElement={resizeElement}
                //
                instruction_position={state.deck.instruction.position}
                instruction_dimensions={state.deck.instruction.dimensions}
                instruction_styles={getInstructionStyles()}
                highlight_styles={getHighlightStyles()}
                //
                countdown_position={getCountdownPosition()}
                countdown_dimensions={getCountdownDimensions()}
                countdown_styles={getCountdownStyles()}
                //
                openPrompt={openPrompt}
              ></CardComposition>

              <Show when={state.viewport.card_selected.timed}>
                <CardMask percentage={state.viewport.masked_percentage}>
                  <CardComposition
                    elements={getElementsOfSelectedType("card")}
                    swatches={getSelectedSwatches(true)}
                    //
                    card_dimensions={state.deck.card_dimensions}
                    card_size={state.viewport.card_size}
                    guides={state.guides}
                    shouldSnap={state.bools.shouldSnap}
                    shiftPressed={state.bools.isShiftPressed}
                    altPressed={state.bools.isAltPressed}
                    //
                    elementIsVisible={elementIsVisible}
                    //
                    selected_element_index={
                      state.viewport.selected_element_index
                    }
                    selectElement={setSelectedElementIndex}
                    //
                    translateInstruction={translateInstruction}
                    translateElement={translateElement}
                    //
                    resizeInstruction={resizeInstruction}
                    resizeElement={resizeElement}
                    //
                    translateCountdown={translateCountdown}
                    resizeCountdown={resizeCountdown}
                    //
                    translateElement={translateElement}
                    resizeElement={resizeElement}
                    //
                    instruction_position={state.deck.instruction.position}
                    instruction_dimensions={state.deck.instruction.dimensions}
                    instruction_styles={getInstructionStyles()}
                    highlight_styles={getHighlightStyles()}
                    //
                    countdown_position={getCountdownPosition()}
                    countdown_dimensions={getCountdownDimensions()}
                    countdown_styles={getCountdownStyles()}
                    //
                    openPrompt={openPrompt}
                    masked={true}
                  ></CardComposition>
                </CardMask>
              </Show>
            </div>
            {!state.bools.areGuidesHidden ? (
              <Guides
                card_dim={state.deck.card_dimensions}
                guides={state.guides}
                shouldSnap={state.bools.shouldSnap}
              ></Guides>
            ) : null}
          </CardContainer>

          <BottomPanel
            setType={setType}
            typeInFocus={state.viewport.card_selected.type}
          ></BottomPanel>
        </Viewport>
        <LongPanel className="right_panel">
          <FlexRow
            style={{
              "padding-bottom": "0px",
              "justify-content": "flex-end",
              height: "25px",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                flex: 1,
                "text-align": "left",
                "margin-left": "6px",
                "align-self": "center",
              }}
            >
              🃏 card editor for <i>{card_id}</i>
            </span>
            <Button onClick={toggleTypeManager}>manage types</Button>
            <Button onClick={saveDeck}>overview</Button>
            <Button onClick={createNewCard}>new card</Button>
            <Button onClick={saveDeck}>save card</Button>
          </FlexRow>
          <LongPanel
            style={{
              "flex-direction": "row",
              overflow: "hidden",
              "margin-top": "6px",
              height: "100%",
            }}
          >
            <LongPanel style={{ width: "300px", overflow: "auto" }}>
              <HeaderPanel label="Card Type" visible={true}>
                <GridRow
                  style={{
                    "padding-top": "10px",
                  }}
                >
                  <Label>type</Label>
                  <GridRow
                    style={{
                      "grid-column": "span 3",
                      "grid-template-columns": "repeat(3, 1fr)",
                      "row-gap": "6px",
                      padding: "0px",
                    }}
                  >
                    <For each={Object.keys(state.deck.designs)}>
                      {(type) => (
                        <Button
                          className={isTypeSelected(type) ? "focus" : ""}
                          style={{ flex: 1 }}
                          onClick={() => setType(type)}
                        >
                          {type}
                        </Button>
                      )}
                    </For>
                  </GridRow>
                </GridRow>
                <Show when={state.viewport.card_selected.type !== "back"}>
                  <GridRow style={{ "margin-bottom": "6px" }}>
                    <LabeledInput
                      label="choice "
                      type="checkbox"
                      checked={state.viewport.card_selected.choice}
                      onChange={(checked) => setChoice(checked)}
                      style={{ padding: "0px" }}
                    ></LabeledInput>
                    <LabeledInput
                      label="timed"
                      type="checkbox"
                      checked={state.viewport.card_selected.timed}
                      onChange={(checked) => setTimed(checked)}
                      style={{ padding: "0px" }}
                    ></LabeledInput>

                    <Button
                      style={{ flex: 1 }}
                      onClick={() => changeInstructionText()}
                      style={{ "grid-column": "span 2" }}
                    >
                      random instruction
                    </Button>
                  </GridRow>
                </Show>
              </HeaderPanel>
              <Swatches
                // swatches={getSelectedSwatches()}
                swatches={getSelectedSwatches(state.viewport.masked_styling)}
                setSwatch={setSwatch}
                addSwatch={addSwatch}
                timed={state.viewport.card_selected.timed}
                masked_styling={state.viewport.masked_styling}
                toggleMaskedStyling={(e) => toggleMaskedStyling(e)}
                no_modes={state.viewport.card_selected.type === "back"}
              ></Swatches>

              <Show when={selectedElementIsType("svg")}>
                <SVGStyling
                  header="Custom Text Styling"
                  styles={getSelectedElement().styles}
                  swatches={getSelectedSwatches(state.viewport.masked_styling)}
                  setStyleSVG={setStyleSVG}
                  masked_styling={state.viewport.masked_styling}
                  toggleMaskedStyling={(e) => toggleMaskedStyling(e)}
                  no_modes={state.viewport.card_selected.type === "back"}
                ></SVGStyling>
              </Show>
              <Show when={getSelectedType() && getInstruction()}>
                <TextStyling
                  header="Instruction Styling"
                  styles={getInstructionStyles()}
                  swatches={getSelectedSwatches(state.viewport.masked_styling)}
                  onChange={(type, value) =>
                    setStyleInstruction({ type, value })
                  }
                  masked_styling={state.viewport.masked_styling}
                  toggleMaskedStyling={(e) => toggleMaskedStyling(e)}
                  visible={true}
                  no_modes={state.viewport.card_selected.type === "back"}
                ></TextStyling>
                <HighlightStyling
                  styles={getHighlightStyles()}
                  swatches={getSelectedSwatches(state.viewport.masked_styling)}
                  onChange={(type, value) => setHighlightStyle({ type, value })}
                  masked_styling={state.viewport.masked_styling}
                  toggleMaskedStyling={(e) => toggleMaskedStyling(e)}
                  visible={true}
                  no_modes={state.viewport.card_selected.type === "back"}
                ></HighlightStyling>
                <TextStyling
                  header="Countdown Styling"
                  styles={getCountdownStyles()}
                  swatches={getSelectedSwatches(state.viewport.masked_styling)}
                  onChange={(type, value) => setCountdownStyle({ type, value })}
                  masked_styling={state.viewport.masked_styling}
                  toggleMaskedStyling={(e) => toggleMaskedStyling(e)}
                  visible={false}
                  no_modes={state.viewport.card_selected.type === "back"}
                ></TextStyling>
              </Show>

              <Show when={selectedElementIsType("text")}>
                <TextStyling
                  header="Custom Text Styling"
                  styles={getSelectedElement().styles}
                  swatches={getSelectedSwatches(state.viewport.masked_styling)}
                  onChange={(type, value) =>
                    setStyleElement({
                      index: state.viewport.selected_element_index,
                      type,
                      value,
                    })
                  }
                  no_modes={state.viewport.card_selected.type === "back"}
                ></TextStyling>
              </Show>

              <HeaderPanel label="Card Styles" visible={false}>
                <FlexRow>
                  <LabeledColorPicker
                    label="background"
                    value={state.deck.background}
                    onChange={setBackground}
                    swatches={getSelectedSwatches()}
                  ></LabeledColorPicker>

                  <LabeledInput
                    label="ratio"
                    value={parseInt(state.deck.card_dimensions.width)}
                    onChange={(value) => setCardDimension("width", value)}
                  ></LabeledInput>
                </FlexRow>
              </HeaderPanel>
            </LongPanel>
            <LongPanel
              style={{
                width: "300px",
                overflow: "auto",
                "border-left": "1px solid var(--light)",
              }}
            >
              <HierarchyList
                elements={getElementsOfSelectedType()}
                changeOrderElement={changeOrderElement}
                elementIsVisible={elementIsVisible}
                removeElement={props.removeElement}
                setLockedElement={setLockedElement}
                toggleVisibilityElement={toggleVisibilityElement}
                selectElement={setSelectedElementIndex}
                selected_element_index={state.viewport.selected_element_index}
                card_selected={state.viewport.card_selected.type}
                no_modes={state.viewport.card_selected.type === "back"}
              ></HierarchyList>
            </LongPanel>
          </LongPanel>
        </LongPanel>
      </App>
    </>
  );
}

export default App;
