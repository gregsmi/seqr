"use strict";(self.webpackChunkseqr=self.webpackChunkseqr||[]).push([[814],{59814:function(t,e,n){n.r(e);var r=n(92437),o=n(66318),a=n.n(o),i=n(20347),u=n(65351),c=n(50352),l=n(64361),f=n(5130),s=n(769),p=n(5439),d=n(68011),y=n(30315),g=n(89504);function b(t){return b="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},b(t)}function m(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function v(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function h(t,e){if(e&&("object"===b(e)||"function"==typeof e))return e;if(void 0!==e)throw new TypeError("Derived constructors may only return object or undefined");return j(t)}function S(t){return S=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)},S(t)}function j(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function w(t,e){return w=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},w(t,e)}function x(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}var O=400,k=600,E=10,I=40,P=30,_=45,q=function(t){function e(){var t,n;m(this,e);for(var r=arguments.length,o=new Array(r),a=0;a<r;a++)o[a]=arguments[a];return x(j(n=h(this,(t=S(e)).call.apply(t,[this].concat(o)))),"setSvgElement",(function(t){n.svg=t})),n}var n,o,a;return function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&w(t,e)}(e,t),n=e,(o=[{key:"componentDidMount",value:function(){var t=this.props,e=t.data,n=t.genesById,r=Object.values(e),o=(0,f.Z)(this.svg).append("g").attr("transform","translate(".concat(_,",").concat(E,")")),a=(0,l.BY)().domain((0,u.We)(r.map((function(t){return t.zScore})))).range([0,k]),i=(0,l.p2)().domain((0,u.We)(r.map((function(t){return t.pValue})))).range([0,O]);o.append("g").attr("transform","translate(0,".concat(405,")")).call((0,c.LL)(a).tickSizeOuter(0)),o.append("g").attr("transform","translate(-10,0)").call((0,c.y4)(i).tickSizeOuter(0).ticks(5,(function(t){return-Math.log10(t)}))),o.append("text").attr("text-anchor","end").attr("y",O+I).attr("x",300).text("Z-score"),o.append("text").attr("text-anchor","end").attr("transform","rotate(-90)").attr("y",10-_).attr("x",I-200).text("-log(P-value)");var s=o.append("g").selectAll("dot").data(r).enter().append("g");s.append("circle").attr("cx",(function(t){return a(t.zScore)})).attr("cy",(function(t){return i(t.pValue)})).attr("r",3).style("fill",(function(t){return t.isSignificant?"red":"lightgrey"})),s.append("text").text((function(t){return t.isSignificant?(n[t.geneId]||{}).geneSymbol:null})).attr("text-anchor",(function(t){return a(t.zScore)>500?"end":"start"})).attr("x",(function(t){var e=a(t.zScore);return e+5*(e>500?-1:1)})).attr("y",(function(t){return i(t.pValue)})).style("fill","red").style("font-weight","bold")}},{key:"render",value:function(){return r.createElement("svg",{ref:this.setSvgElement,width:k+_+P,height:O+E+I})}}])&&v(n.prototype,o),a&&v(n,a),e}(r.PureComponent);x(q,"propTypes",{data:a().object,genesById:a().object});var B=r.memo((function(t){var e=t.sample,n=t.rnaSeqData,o=t.genesById,a=t.familyGuid,i=t.loading,u=t.load;return r.createElement(p.Z,{content:n,contentId:e.individualGuid,load:u,loading:i},r.createElement(d.d,{buttonText:"Search for variants in outlier genes",icon:"search",location:Object.values(n||{}).filter((function(t){return t.isSignificant})).map((function(t){return t.geneId})).join(","),familyGuid:a,floated:"right"}),r.createElement(q,{data:n,genesById:o}))}));B.propTypes={sample:a().object.isRequired,familyGuid:a().string.isRequired,rnaSeqData:a().object,genesById:a().object,loading:a().bool,load:a().func};var z={load:y.RY};e.default=(0,i.$j)((function(t,e){var n;return{rnaSeqData:null===(n=(0,s.CY)(t)[e.sample.individualGuid])||void 0===n?void 0:n.outliers,genesById:(0,s.eg)(t),loading:(0,g.kD)(t)}}),z)(B)}}]);