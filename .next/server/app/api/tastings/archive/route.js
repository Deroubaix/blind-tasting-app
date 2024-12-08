/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/tastings/archive/route";
exports.ids = ["app/api/tastings/archive/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("@prisma/client");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Ftastings%2Farchive%2Froute&page=%2Fapi%2Ftastings%2Farchive%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ftastings%2Farchive%2Froute.ts&appDir=%2FUsers%2Fmarishaderoubaix%2Fblind-tasting-app%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fmarishaderoubaix%2Fblind-tasting-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Ftastings%2Farchive%2Froute&page=%2Fapi%2Ftastings%2Farchive%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ftastings%2Farchive%2Froute.ts&appDir=%2FUsers%2Fmarishaderoubaix%2Fblind-tasting-app%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fmarishaderoubaix%2Fblind-tasting-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_marishaderoubaix_blind_tasting_app_src_app_api_tastings_archive_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/tastings/archive/route.ts */ \"(rsc)/./src/app/api/tastings/archive/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/tastings/archive/route\",\n        pathname: \"/api/tastings/archive\",\n        filename: \"route\",\n        bundlePath: \"app/api/tastings/archive/route\"\n    },\n    resolvedPagePath: \"/Users/marishaderoubaix/blind-tasting-app/src/app/api/tastings/archive/route.ts\",\n    nextConfigOutput,\n    userland: _Users_marishaderoubaix_blind_tasting_app_src_app_api_tastings_archive_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZ0YXN0aW5ncyUyRmFyY2hpdmUlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRnRhc3RpbmdzJTJGYXJjaGl2ZSUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRnRhc3RpbmdzJTJGYXJjaGl2ZSUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRm1hcmlzaGFkZXJvdWJhaXglMkZibGluZC10YXN0aW5nLWFwcCUyRnNyYyUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGVXNlcnMlMkZtYXJpc2hhZGVyb3ViYWl4JTJGYmxpbmQtdGFzdGluZy1hcHAmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQStGO0FBQ3ZDO0FBQ3FCO0FBQytCO0FBQzVHO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qix5R0FBbUI7QUFDM0M7QUFDQSxjQUFjLGtFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsc0RBQXNEO0FBQzlEO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQzBGOztBQUUxRiIsInNvdXJjZXMiOlsiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvVXNlcnMvbWFyaXNoYWRlcm91YmFpeC9ibGluZC10YXN0aW5nLWFwcC9zcmMvYXBwL2FwaS90YXN0aW5ncy9hcmNoaXZlL3JvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS90YXN0aW5ncy9hcmNoaXZlL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvdGFzdGluZ3MvYXJjaGl2ZVwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvdGFzdGluZ3MvYXJjaGl2ZS9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIi9Vc2Vycy9tYXJpc2hhZGVyb3ViYWl4L2JsaW5kLXRhc3RpbmctYXBwL3NyYy9hcHAvYXBpL3Rhc3RpbmdzL2FyY2hpdmUvcm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Ftastings%2Farchive%2Froute&page=%2Fapi%2Ftastings%2Farchive%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ftastings%2Farchive%2Froute.ts&appDir=%2FUsers%2Fmarishaderoubaix%2Fblind-tasting-app%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fmarishaderoubaix%2Fblind-tasting-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(rsc)/./lib/auth.ts":
/*!*********************!*\
  !*** ./lib/auth.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   verifyToken: () => (/* binding */ verifyToken)\n/* harmony export */ });\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jsonwebtoken */ \"(rsc)/./node_modules/jsonwebtoken/index.js\");\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jsonwebtoken__WEBPACK_IMPORTED_MODULE_0__);\n\nconst SECRET_KEY = process.env.JWT_SECRET || \"fallback-secret-key\";\nfunction verifyToken(token) {\n    try {\n        return jsonwebtoken__WEBPACK_IMPORTED_MODULE_0___default().verify(token, SECRET_KEY);\n    } catch (error) {\n        throw new Error(\"Invalid Token\");\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYXV0aC50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBK0I7QUFFL0IsTUFBTUMsYUFBYUMsUUFBUUMsR0FBRyxDQUFDQyxVQUFVLElBQUk7QUFFdEMsU0FBU0MsWUFBWUMsS0FBYTtJQUN2QyxJQUFJO1FBQ0YsT0FBT04sMERBQVUsQ0FBQ00sT0FBT0w7SUFDM0IsRUFBRSxPQUFPTyxPQUFPO1FBQ2QsTUFBTSxJQUFJQyxNQUFNO0lBQ2xCO0FBQ0YiLCJzb3VyY2VzIjpbIi9Vc2Vycy9tYXJpc2hhZGVyb3ViYWl4L2JsaW5kLXRhc3RpbmctYXBwL2xpYi9hdXRoLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBqd3QgZnJvbSBcImpzb253ZWJ0b2tlblwiO1xuXG5jb25zdCBTRUNSRVRfS0VZID0gcHJvY2Vzcy5lbnYuSldUX1NFQ1JFVCB8fCBcImZhbGxiYWNrLXNlY3JldC1rZXlcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHZlcmlmeVRva2VuKHRva2VuOiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gand0LnZlcmlmeSh0b2tlbiwgU0VDUkVUX0tFWSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBUb2tlblwiKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbImp3dCIsIlNFQ1JFVF9LRVkiLCJwcm9jZXNzIiwiZW52IiwiSldUX1NFQ1JFVCIsInZlcmlmeVRva2VuIiwidG9rZW4iLCJ2ZXJpZnkiLCJlcnJvciIsIkVycm9yIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./src/app/api/tastings/archive/route.ts":
/*!***********************************************!*\
  !*** ./src/app/api/tastings/archive/route.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../lib/auth */ \"(rsc)/./lib/auth.ts\");\n\n\nconst prisma = new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nasync function POST(request) {\n    const authHeader = request.headers.get(\"Authorization\");\n    const token = authHeader?.split(\" \")[1];\n    if (!token) {\n        return new Response(JSON.stringify({\n            error: \"Access Denied\"\n        }), {\n            status: 401,\n            headers: {\n                \"Content-Type\": \"application/json\"\n            }\n        });\n    }\n    try {\n        const decoded = (0,_lib_auth__WEBPACK_IMPORTED_MODULE_1__.verifyToken)(token);\n        const { tastingId } = await request.json();\n        const updatedTasting = await prisma.tasting.update({\n            where: {\n                id: tastingId,\n                userId: decoded.userId\n            },\n            data: {\n                isArchived: true\n            }\n        });\n        return new Response(JSON.stringify({\n            message: \"Tasting archived\",\n            updatedTasting\n        }), {\n            status: 200,\n            headers: {\n                \"Content-Type\": \"application/json\"\n            }\n        });\n    } catch (error) {\n        console.error(\"Error archiving tasting:\", error);\n        return new Response(JSON.stringify({\n            error: \"Invalid Request\"\n        }), {\n            status: 400,\n            headers: {\n                \"Content-Type\": \"application/json\"\n            }\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS90YXN0aW5ncy9hcmNoaXZlL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBOEM7QUFDUTtBQUV0RCxNQUFNRSxTQUFTLElBQUlGLHdEQUFZQTtBQUV4QixlQUFlRyxLQUFLQyxPQUFnQjtJQUN6QyxNQUFNQyxhQUFhRCxRQUFRRSxPQUFPLENBQUNDLEdBQUcsQ0FBQztJQUN2QyxNQUFNQyxRQUFRSCxZQUFZSSxNQUFNLElBQUksQ0FBQyxFQUFFO0lBRXZDLElBQUksQ0FBQ0QsT0FBTztRQUNWLE9BQU8sSUFBSUUsU0FBU0MsS0FBS0MsU0FBUyxDQUFDO1lBQUVDLE9BQU87UUFBZ0IsSUFBSTtZQUM5REMsUUFBUTtZQUNSUixTQUFTO2dCQUFFLGdCQUFnQjtZQUFtQjtRQUNoRDtJQUNGO0lBRUEsSUFBSTtRQUNGLE1BQU1TLFVBQWVkLHNEQUFXQSxDQUFDTztRQUNqQyxNQUFNLEVBQUVRLFNBQVMsRUFBRSxHQUFHLE1BQU1aLFFBQVFhLElBQUk7UUFFeEMsTUFBTUMsaUJBQWlCLE1BQU1oQixPQUFPaUIsT0FBTyxDQUFDQyxNQUFNLENBQUM7WUFDakRDLE9BQU87Z0JBQUVDLElBQUlOO2dCQUFXTyxRQUFRUixRQUFRUSxNQUFNO1lBQUM7WUFDL0NDLE1BQU07Z0JBQUVDLFlBQVk7WUFBSztRQUMzQjtRQUVBLE9BQU8sSUFBSWYsU0FDVEMsS0FBS0MsU0FBUyxDQUFDO1lBQUVjLFNBQVM7WUFBb0JSO1FBQWUsSUFDN0Q7WUFDRUosUUFBUTtZQUNSUixTQUFTO2dCQUFFLGdCQUFnQjtZQUFtQjtRQUNoRDtJQUVKLEVBQUUsT0FBT08sT0FBTztRQUNkYyxRQUFRZCxLQUFLLENBQUMsNEJBQTRCQTtRQUMxQyxPQUFPLElBQUlILFNBQVNDLEtBQUtDLFNBQVMsQ0FBQztZQUFFQyxPQUFPO1FBQWtCLElBQUk7WUFDaEVDLFFBQVE7WUFDUlIsU0FBUztnQkFBRSxnQkFBZ0I7WUFBbUI7UUFDaEQ7SUFDRjtBQUNGIiwic291cmNlcyI6WyIvVXNlcnMvbWFyaXNoYWRlcm91YmFpeC9ibGluZC10YXN0aW5nLWFwcC9zcmMvYXBwL2FwaS90YXN0aW5ncy9hcmNoaXZlL3JvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByaXNtYUNsaWVudCB9IGZyb20gXCJAcHJpc21hL2NsaWVudFwiO1xuaW1wb3J0IHsgdmVyaWZ5VG9rZW4gfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vbGliL2F1dGhcIjtcblxuY29uc3QgcHJpc21hID0gbmV3IFByaXNtYUNsaWVudCgpO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXF1ZXN0OiBSZXF1ZXN0KSB7XG4gIGNvbnN0IGF1dGhIZWFkZXIgPSByZXF1ZXN0LmhlYWRlcnMuZ2V0KFwiQXV0aG9yaXphdGlvblwiKTtcbiAgY29uc3QgdG9rZW4gPSBhdXRoSGVhZGVyPy5zcGxpdChcIiBcIilbMV07XG5cbiAgaWYgKCF0b2tlbikge1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogXCJBY2Nlc3MgRGVuaWVkXCIgfSksIHtcbiAgICAgIHN0YXR1czogNDAxLFxuICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxuICAgIH0pO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBkZWNvZGVkOiBhbnkgPSB2ZXJpZnlUb2tlbih0b2tlbik7XG4gICAgY29uc3QgeyB0YXN0aW5nSWQgfSA9IGF3YWl0IHJlcXVlc3QuanNvbigpO1xuXG4gICAgY29uc3QgdXBkYXRlZFRhc3RpbmcgPSBhd2FpdCBwcmlzbWEudGFzdGluZy51cGRhdGUoe1xuICAgICAgd2hlcmU6IHsgaWQ6IHRhc3RpbmdJZCwgdXNlcklkOiBkZWNvZGVkLnVzZXJJZCB9LFxuICAgICAgZGF0YTogeyBpc0FyY2hpdmVkOiB0cnVlIH0sXG4gICAgfSk7XG5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKFxuICAgICAgSlNPTi5zdHJpbmdpZnkoeyBtZXNzYWdlOiBcIlRhc3RpbmcgYXJjaGl2ZWRcIiwgdXBkYXRlZFRhc3RpbmcgfSksXG4gICAgICB7XG4gICAgICAgIHN0YXR1czogMjAwLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICB9XG4gICAgKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgYXJjaGl2aW5nIHRhc3Rpbmc6XCIsIGVycm9yKTtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6IFwiSW52YWxpZCBSZXF1ZXN0XCIgfSksIHtcbiAgICAgIHN0YXR1czogNDAwLFxuICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxuICAgIH0pO1xuICB9XG59XG4iXSwibmFtZXMiOlsiUHJpc21hQ2xpZW50IiwidmVyaWZ5VG9rZW4iLCJwcmlzbWEiLCJQT1NUIiwicmVxdWVzdCIsImF1dGhIZWFkZXIiLCJoZWFkZXJzIiwiZ2V0IiwidG9rZW4iLCJzcGxpdCIsIlJlc3BvbnNlIiwiSlNPTiIsInN0cmluZ2lmeSIsImVycm9yIiwic3RhdHVzIiwiZGVjb2RlZCIsInRhc3RpbmdJZCIsImpzb24iLCJ1cGRhdGVkVGFzdGluZyIsInRhc3RpbmciLCJ1cGRhdGUiLCJ3aGVyZSIsImlkIiwidXNlcklkIiwiZGF0YSIsImlzQXJjaGl2ZWQiLCJtZXNzYWdlIiwiY29uc29sZSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/tastings/archive/route.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/semver","vendor-chunks/jsonwebtoken","vendor-chunks/jws","vendor-chunks/ecdsa-sig-formatter","vendor-chunks/safe-buffer","vendor-chunks/ms","vendor-chunks/lodash.once","vendor-chunks/lodash.isstring","vendor-chunks/lodash.isplainobject","vendor-chunks/lodash.isnumber","vendor-chunks/lodash.isinteger","vendor-chunks/lodash.isboolean","vendor-chunks/lodash.includes","vendor-chunks/jwa","vendor-chunks/buffer-equal-constant-time"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Ftastings%2Farchive%2Froute&page=%2Fapi%2Ftastings%2Farchive%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ftastings%2Farchive%2Froute.ts&appDir=%2FUsers%2Fmarishaderoubaix%2Fblind-tasting-app%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fmarishaderoubaix%2Fblind-tasting-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();