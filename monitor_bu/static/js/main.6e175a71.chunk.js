(this.webpackJsonpgame_master=this.webpackJsonpgame_master||[]).push([[0],{123:function(e,t){},124:function(e,t){},126:function(e,t){},128:function(e,t){},137:function(e,t,c){"use strict";c.r(t);var n=c(0),r=c.n(n),o=c(63),s=c.n(o),a=(c(72),c(21)),i=c(9),l=c(12),u=c.n(l),b=c(16),j=c(22),d=(c(74),c(2)),f=function(e){var t=this,c=Object(n.useState)(e),r=Object(b.a)(c,2),o=r[0],s=r[1],a=Object(n.useRef)(e);this.state=o,Object(n.useEffect)((function(){o===a.current&&(t.state=o)}),[o]),this.get=function(){return a.current},this.set=function(e){a.current=e,s(e),t.state=a.current}},O=c(64),h=c.n(O),p=c(1);function m(e){var t=e.room_url,c=e.role,r=e.role_url,o=Object(n.useRef)(),s=Object(n.useCallback)((function(){window.open(o.current)}),[]),a=Object(n.useCallback)((function(e){h()(o.current),e.target.innerHTML="copied!",setTimeout((function(){e.target.innerHTML="copy"}),1e3)}),[]);return Object(n.useEffect)((function(){console.log("room_url is ",t),o.current="".concat(window._url.play,"/").concat(t).concat(r)}),[t,r]),Object(p.jsx)("div",{className:"role",style:{border:"1px solid ".concat("connected"===c.status?"green":"finished"===c.status?"blue":"red")},children:c?Object(p.jsxs)(p.Fragment,{children:[Object(p.jsxs)("div",{className:"marginBottom",children:[Object(p.jsxs)("div",{className:"row",children:[Object(p.jsx)("label",{children:"role"}),Object(p.jsx)("span",{children:c.role_id})]}),Object(p.jsxs)("div",{className:"row",children:[Object(p.jsx)("label",{children:"status"})," ",Object(p.jsx)("span",{style:{color:"connected"===c.status?"green":"finished"===c.status?"blue":"red"},children:c.status?c.status:"never connected"})]}),"connected"===c.status?Object(p.jsxs)("div",{className:"row",children:[Object(p.jsx)("label",{children:"ping"}),Object(p.jsx)("span",{style:{color:"error"===c.ping?"red":"black"},children:c.ping?"".concat(c.ping,"ms"):null})]}):null]}),Object(p.jsxs)("div",{className:"marginBottom instruction",children:[Object(p.jsx)("div",{className:"row",children:Object(p.jsx)("label",{children:"card"})}),Object(p.jsxs)("div",{className:"row",children:[Object(p.jsx)("label",{className:"margin",children:"type"})," ",c.card?Object(p.jsx)("span",{class:"italic",children:c.card.type}):null]}),Object(p.jsxs)("div",{className:"row",children:[Object(p.jsx)("label",{className:"margin",children:"text"})," ",c.card&&"video"!==c.card.type?Object(p.jsx)("span",{children:c.card.text}):null]})]}),Object(p.jsxs)("div",{className:"flex",children:[Object(p.jsx)("button",{onClick:s,children:"open "}),Object(p.jsx)("button",{onClick:a,children:"copy"})]})]}):null})}var x=function(e){var t=e._mqtt,c=Object(d.f)().script_id,r=new f({}),o=new f(!1);Object(n.useEffect)(Object(j.a)(u.a.mark((function e(){var n;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(o.state){e.next=13;break}return o.set(!0),e.next=4,fetch("".concat(window._url.fetch,"/api/room/getRooms/").concat(c));case 4:return n=e.sent,e.next=7,n.json();case 7:if(n=e.sent){e.next=10;break}return e.abrupt("return");case 10:Object.entries(n).forEach((function(e){var t=Object(b.a)(e,2);t[0],t[1]})),t.subscribe("/createRoom/".concat(c),(function(e,t){var c=JSON.parse(e),n=c.room_url,r=c.roles,o=c.script_id;console.log("/createRoom/".concat(o),n,r,o),s({room_url:n,roles:r,script_id:o})})),r.set(n);case 13:case"end":return e.stop()}}),e)}))),[c,r]);var s=Object(n.useCallback)((function(e){var t=e.room_url,c=e.roles,n=e.script_id,o=Object(i.a)({},r.get());console.log(o),r.set(Object(i.a)(Object(i.a)({},o),{},Object(a.a)({},t,{roles:c,script_id:n})))}),[r.state]);function l(e){var o=e.room,s=e.room_url,l=Object(n.useCallback)(Object(j.a)(u.a.mark((function e(){var t;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch("".concat(window._url.fetch,"/api/room/delete/").concat(s));case 2:if(e.sent){e.next=5;break}return e.abrupt("return");case 5:delete(t=Object(i.a)({},r.get()))[s],r.set(t);case 8:case"end":return e.stop()}}),e)}))),[r.state]),d=Object(n.useCallback)(Object(j.a)(u.a.mark((function e(){return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch("".concat(window._url.fetch,"/api/room/restart/").concat(s));case 2:if(e.sent){e.next=5;break}return e.abrupt("return");case 5:case"end":return e.stop()}}),e)}))),[r.state]),f=Object(n.useCallback)((function(){window.open("".concat(window._url.editor,"/test/").concat(s))})),O=Object(n.useCallback)((function(e){var c=e.room_url,n=e.roles,o=function(e){var t=e.room_url,c=e.role_url,n=e.state,o=r.get();if(o[t]){var s=o[t].roles,l=(s[c],Object(i.a)(Object(i.a)({},o),{},Object(a.a)({},t,Object(i.a)(Object(i.a)({},o[t]),{},{roles:Object(i.a)(Object(i.a)({},s),{},Object(a.a)({},c,Object(i.a)(Object(i.a)({},o[t].roles[c]),n)))}))));r.set(l)}else console.error(o,t,c,n)};n&&(Object.entries(n).forEach((function(e){var n=Object(b.a)(e,2),r=n[0];n[1]&&(t.subscribe("/monitor/".concat(c,"/").concat(r,"/card"),(function(e,t){var n=JSON.parse(e);o({room_url:c,role_url:r,state:{card:n}})})),t.subscribe("/monitor/".concat(c,"/").concat(r,"/status"),(function(e,t){try{var n=JSON.parse(e);console.log(r,n),o({room_url:c,role_url:r,state:n})}catch(s){console.error(s,e)}})),t.subscribe("/monitor/".concat(c,"/").concat(r,"/ping"),(function(e,t){try{var n=JSON.parse(e);console.log("receive ping"),o({room_url:c,role_url:r,state:n})}catch(s){console.error(s,e)}})))})),t.subscribe("/".concat(c,"/#"),(function(e,t){e=JSON.parse(e)})))}),[r.state]);return Object(n.useEffect)((function(){O({room_url:s,roles:o.roles})}),[]),Object(p.jsxs)("div",{className:"room",children:[Object(p.jsxs)("div",{className:"top",children:[Object(p.jsxs)("h1",{children:["room ",c," ",s," "]})," ",Object(p.jsx)("button",{onClick:l,children:"delete"}),Object(p.jsx)("button",{onClick:d,children:"restart"}),Object(p.jsx)("button",{onClick:f,children:"combo"})]}),Object(p.jsx)("div",{className:"roles",children:o&&o.roles?Object.entries(o.roles).sort((function(e,t){return e[1].role_id-t[1].role_id})).map((function(e){var t=Object(b.a)(e,2),c=t[0],n=t[1];return Object(p.jsx)(m,{room_url:s,role_url:c,role:n},c)})):null})]})}return Object(p.jsx)("div",{className:"App",children:Object.entries(r.state).map((function(e){var t=Object(b.a)(e,2),c=t[0],n=t[1];return Object(p.jsx)(l,{room:n,room_url:c},c)}))})},v=c(35),w=c(66),g=c(67),_=c.n(g),k=-1!=window.location.href.indexOf("localhost");window._url={mqtt:k?"localhost:8883":"socket.datingproject.net/mqtt",editor:k?"http://localhost:3000":"https://script.datingproject.net/",fetch:k?"http://localhost:8080":"https://fetch.datingproject.net",play:k?"http://localhost:3001":"https://play.datingproject.net",monitor:k?"http://localhost:3004":"https://monitor.datingproject.net"};var N=new function e(){var t=this;Object(w.a)(this,e),this.connect=function(){var e=Object(j.a)(u.a.mark((function e(c){var n,r,o=arguments;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n=o.length>1&&void 0!==o[1]&&o[1],r=o.length>2&&void 0!==o[2]&&o[2],c="".concat(n?r?"wss":"ws":"mqtt","://").concat(c),console.log(c),e.abrupt("return",new Promise((function(e){t.client=_.a.connect(c),t.client.on("message",t.receive),t.client.on("disconnect",(function(){console.log("oops disconnected")})),t.client.on("connect",(function(){console.log("connected"),e(t)}))})));case 6:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),this.subscribe=function(e,c){t.client.subscribe("".concat(t.base).concat(e)),t.subscriptions[e]={function:c}},this.receive=function(e,c){for(var n in t.subscriptions)if(-1!=n.indexOf("#")){var r=n.split("#")[0];-1!=e.indexOf(r)&&t.subscriptions[n].function(c,e)}else e==="".concat(t.base).concat(n)&&t.subscriptions[n].function(c,e)},this.send=function(e,c){t.client.publish("".concat(t.base).concat(e),c)},this.subscriptions={},this.base=""};N.connect(window._url.mqtt),s.a.render(Object(p.jsx)(r.a.StrictMode,{children:Object(p.jsx)(v.a,{children:Object(p.jsx)(d.c,{children:Object(p.jsxs)(d.a,{path:"/:script_id",children:[Object(p.jsx)(x,{_mqtt:N}),Object(p.jsx)("div",{className:"background",children:Object(p.jsx)("div",{})})]})})})}),document.getElementById("root"))},72:function(e,t,c){},74:function(e,t,c){},87:function(e,t){},89:function(e,t){}},[[137,1,2]]]);
//# sourceMappingURL=main.6e175a71.chunk.js.map