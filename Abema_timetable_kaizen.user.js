// ==UserScript==
// @name         Abema Timetable Kaizen
// @namespace    https://github.com/querykuma/
// @version      1.0
// @description  ABEMA番組表の上部に隠れる番組タイトルを表示、現在時刻のバーを常に表示、アニメ番組までスクロール、モーダルウィンドウをクリック
// @author       Query Kuma
// @match        https://abema.tv/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  console.log("Abema Timetable Kaizen");

  var flag_first_run = true;

  var get_marginTop = () => {
    var node = document.querySelector(".com-timetable-DesktopTimeTableWrapper__content-wrapper");
    var cs = getComputedStyle(node);
    var m = cs.marginTop.match(/^(\d+)px$/);
    return m[1];
  };

  var is_node_horizontal_visible = function (node) {
    var bcr = node.getBoundingClientRect();

    return bcr.left <= document.scrollingElement.scrollWidth - document.scrollingElement.scrollLeft &&
      bcr.right >= -document.scrollingElement.scrollLeft;
  };

  var is_node_vertical_visible = function (node, marginTop) {
    var bcr = node.getBoundingClientRect();

    return bcr.top <= marginTop &&
      bcr.bottom >= marginTop;
  };

  var clear_adjusts = () => {
    var targets = document.querySelectorAll(".kaizen_adjust_position_tv_title");
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];

      target.style.top = "";
      target.style.position = "";
      target.classList.remove("kaizen_adjust_position_tv_title");
    }
  };

  // 現在時刻のバーを常時表示させる
  var always_show_current_time = () => {
    var id_kaizen_style = document.querySelector("#kaizen_style");
    if (id_kaizen_style) return;

    document.head.insertAdjacentHTML('beforeend', `<style id="kaizen_style">
.com-timetable-TimeTableListDateBar-animation--fade-out {
    opacity: 100!important;
    visibility: visible!important;
}</style>`);
  };

  var scroll_to_target = () => {
    // チャンネルヘッダーのa hrefが次のtarget_stringを含む番組の位置までスクロール
    var target_string = "anime";

    var channel_headers = document.querySelector(".com-timetable-ChannelIconHeader").children;
    for (var i = 0; i < channel_headers.length; i++) {
      var channel_header = channel_headers[i];
      var channel_header_href = channel_header.getAttribute("href");
      if (channel_header_href.includes(target_string)) {
        break;
      }
    }

    var dom_scroll = document.querySelector(".com-timetable-DesktopTimeTableWrapper__content-wrapper");
    dom_scroll.scrollLeft = channel_header.getBoundingClientRect().left - channel_headers[0].getBoundingClientRect().left;
  };

  var click_modal = () => {
    document.querySelector("body>div.com-timetable-TimeshiftTutorialModal")?.querySelector("button")?.click();
  };

  var main = () => {

    if (!location.href.startsWith("https://abema.tv/timetable")) {
      return;
    }

    click_modal();

    var marginTop = get_marginTop();
    var timetable = document.querySelector(".com-timetable-TimeTableListTimeTable-wrapper");

    if (flag_first_run) {
      scroll_to_target();
      flag_first_run = false;
    }

    clear_adjusts();

    for (var i = 0; i < timetable.children.length; i++) {
      var timetable_child = timetable.children[i];

      if (is_node_horizontal_visible(timetable_child)) {

        for (var j = 0; j < timetable_child.children.length; j++) {
          var timetable_child_child = timetable_child.children[j];

          if (is_node_vertical_visible(timetable_child_child, marginTop)) {

            var bcr = timetable_child_child.getBoundingClientRect();
            var r = timetable_child_child.querySelector(".com-timetable-TimeTableItem-item__right");

            r.style.top = Math.ceil(marginTop - bcr.top + 10) + "px";
            r.style.position = "absolute";
            r.classList.add("kaizen_adjust_position_tv_title");
          }
        }
      }
    }

    always_show_current_time();
  };

  var timeoutID = null;
  var scroll_mutation_event = (arg) => {
    // 指定時間スクロールイベントやMutationイベントがなければ main を実行する。
    clearTimeout(timeoutID);
    timeoutID = setTimeout(main, 500);
  };

  document.addEventListener('scroll', scroll_mutation_event, { capture: true, passive: false });

  try {
    observer.disconnect();
  } catch (error) { }

  var callback = (mutations) => {
    scroll_mutation_event(mutations);
  };

  var config = { attributes: false, childList: true, subtree: true };
  var observer = new MutationObserver(callback);
  observer.observe(document, config);

})();
