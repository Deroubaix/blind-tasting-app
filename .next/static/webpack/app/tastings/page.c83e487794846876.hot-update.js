"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/tastings/page",{

/***/ "(app-pages-browser)/./node_modules/next/dist/api/navigation.js":
/*!**************************************************!*\
  !*** ./node_modules/next/dist/api/navigation.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _client_components_navigation__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../client/components/navigation */ \"(app-pages-browser)/./node_modules/next/dist/client/components/navigation.js\");\n/* harmony import */ var _client_components_navigation__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_client_components_navigation__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};\n/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in _client_components_navigation__WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== \"default\") __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => _client_components_navigation__WEBPACK_IMPORTED_MODULE_0__[__WEBPACK_IMPORT_KEY__]\n/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);\n\n\n//# sourceMappingURL=navigation.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL25vZGVfbW9kdWxlcy9uZXh0L2Rpc3QvYXBpL25hdmlnYXRpb24uanMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQWdEOztBQUVoRCIsInNvdXJjZXMiOlsiL1VzZXJzL21hcmlzaGFkZXJvdWJhaXgvYmxpbmQtdGFzdGluZy1hcHAvbm9kZV9tb2R1bGVzL25leHQvZGlzdC9hcGkvbmF2aWdhdGlvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgKiBmcm9tICcuLi9jbGllbnQvY29tcG9uZW50cy9uYXZpZ2F0aW9uJztcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bmF2aWdhdGlvbi5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(app-pages-browser)/./node_modules/next/dist/api/navigation.js\n"));

/***/ }),

/***/ "(app-pages-browser)/./src/app/tastings/page.tsx":
/*!***********************************!*\
  !*** ./src/app/tastings/page.tsx ***!
  \***********************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ TastingStartPage)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_navigation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/navigation */ \"(app-pages-browser)/./node_modules/next/dist/api/navigation.js\");\n/* __next_internal_client_entry_do_not_use__ default auto */ \nvar _s = $RefreshSig$();\n\n\nfunction TastingStartPage() {\n    _s();\n    const [wineType, setWineType] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [sound, setSound] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(true);\n    const [timer, setTimer] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const router = (0,next_navigation__WEBPACK_IMPORTED_MODULE_2__.useRouter)();\n    const handleWineTypeSelection = (type)=>{\n        setWineType(type);\n    };\n    const handleTimerSelection = (duration)=>{\n        setTimer(duration);\n    };\n    const handleStartTasting = async ()=>{\n        if (!wineType) {\n            alert(\"Please select a wine type.\");\n            return;\n        }\n        try {\n            const response = await fetch(\"/api/tastings\", {\n                method: \"POST\",\n                headers: {\n                    \"Content-Type\": \"application/json\"\n                },\n                body: JSON.stringify({\n                    wineType,\n                    timerEnabled: timer !== \"No Timer\",\n                    timerDuration: timer !== \"No Timer\" ? timer : null\n                })\n            });\n            if (!response.ok) {\n                const errorData = await response.json();\n                setError(errorData.error || \"Failed to save tasting.\");\n                return;\n            }\n            // Redirect to the wine type page\n            router.push(\"/tastings/\".concat(wineType.toLowerCase()));\n        } catch (err) {\n            console.error(\"Error starting tasting:\", err);\n            setError(\"An unexpected error occurred.\");\n        }\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"main\", {\n        className: \"tasting-start\",\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"section\", {\n                className: \"wine-type\",\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h2\", {\n                        children: \"Select Wine Type\"\n                    }, void 0, false, {\n                        fileName: \"/Users/marishaderoubaix/blind-tasting-app/src/app/tastings/page.tsx\",\n                        lineNumber: 57,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                        onClick: ()=>handleWineTypeSelection(\"White\"),\n                        className: wineType === \"White\" ? \"selected\" : \"\",\n                        children: \"White\"\n                    }, void 0, false, {\n                        fileName: \"/Users/marishaderoubaix/blind-tasting-app/src/app/tastings/page.tsx\",\n                        lineNumber: 58,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                        onClick: ()=>handleWineTypeSelection(\"Red\"),\n                        className: wineType === \"Red\" ? \"selected\" : \"\",\n                        children: \"Red\"\n                    }, void 0, false, {\n                        fileName: \"/Users/marishaderoubaix/blind-tasting-app/src/app/tastings/page.tsx\",\n                        lineNumber: 64,\n                        columnNumber: 9\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"/Users/marishaderoubaix/blind-tasting-app/src/app/tastings/page.tsx\",\n                lineNumber: 56,\n                columnNumber: 7\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"section\", {\n                className: \"options\",\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h2\", {\n                        children: \"Options\"\n                    }, void 0, false, {\n                        fileName: \"/Users/marishaderoubaix/blind-tasting-app/src/app/tastings/page.tsx\",\n                        lineNumber: 73,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"option\",\n                        children: [\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"label\", {\n                                children: \"Sound\"\n                            }, void 0, false, {\n                                fileName: \"/Users/marishaderoubaix/blind-tasting-app/src/app/tastings/page.tsx\",\n                                lineNumber: 75,\n                                columnNumber: 11\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                                onClick: ()=>setSound((prev)=>!prev),\n                                children: sound ? \"On\" : \"Off\"\n                            }, void 0, false, {\n                                fileName: \"/Users/marishaderoubaix/blind-tasting-app/src/app/tastings/page.tsx\",\n                                lineNumber: 76,\n                                columnNumber: 11\n                            }, this)\n                        ]\n                    }, void 0, true, {\n                        fileName: \"/Users/marishaderoubaix/blind-tasting-app/src/app/tastings/page.tsx\",\n                        lineNumber: 74,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"option\",\n                        children: [\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"label\", {\n                                children: \"Timer\"\n                            }, void 0, false, {\n                                fileName: \"/Users/marishaderoubaix/blind-tasting-app/src/app/tastings/page.tsx\",\n                                lineNumber: 81,\n                                columnNumber: 11\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                                onClick: ()=>handleTimerSelection(\"7.5 min\"),\n                                className: timer === \"7.5 min\" ? \"selected\" : \"\",\n                                children: \"7.5 min\"\n                            }, void 0, false, {\n                                fileName: \"/Users/marishaderoubaix/blind-tasting-app/src/app/tastings/page.tsx\",\n                                lineNumber: 82,\n                                columnNumber: 11\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                                onClick: ()=>handleTimerSelection(\"4 min\"),\n                                className: timer === \"4 min\" ? \"selected\" : \"\",\n                                children: \"4 min\"\n                            }, void 0, false, {\n                                fileName: \"/Users/marishaderoubaix/blind-tasting-app/src/app/tastings/page.tsx\",\n                                lineNumber: 88,\n                                columnNumber: 11\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                                onClick: ()=>handleTimerSelection(\"No Timer\"),\n                                className: timer === \"No Timer\" ? \"selected\" : \"\",\n                                children: \"No Timer\"\n                            }, void 0, false, {\n                                fileName: \"/Users/marishaderoubaix/blind-tasting-app/src/app/tastings/page.tsx\",\n                                lineNumber: 94,\n                                columnNumber: 11\n                            }, this)\n                        ]\n                    }, void 0, true, {\n                        fileName: \"/Users/marishaderoubaix/blind-tasting-app/src/app/tastings/page.tsx\",\n                        lineNumber: 80,\n                        columnNumber: 9\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"/Users/marishaderoubaix/blind-tasting-app/src/app/tastings/page.tsx\",\n                lineNumber: 72,\n                columnNumber: 7\n            }, this),\n            error && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                className: \"error\",\n                children: error\n            }, void 0, false, {\n                fileName: \"/Users/marishaderoubaix/blind-tasting-app/src/app/tastings/page.tsx\",\n                lineNumber: 103,\n                columnNumber: 17\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                className: \"start-btn\",\n                onClick: handleStartTasting,\n                children: \"Start Tasting\"\n            }, void 0, false, {\n                fileName: \"/Users/marishaderoubaix/blind-tasting-app/src/app/tastings/page.tsx\",\n                lineNumber: 105,\n                columnNumber: 7\n            }, this)\n        ]\n    }, void 0, true, {\n        fileName: \"/Users/marishaderoubaix/blind-tasting-app/src/app/tastings/page.tsx\",\n        lineNumber: 55,\n        columnNumber: 5\n    }, this);\n}\n_s(TastingStartPage, \"FVPUkgS31j0LrvdMGBgzDe2FTdc=\", false, function() {\n    return [\n        next_navigation__WEBPACK_IMPORTED_MODULE_2__.useRouter\n    ];\n});\n_c = TastingStartPage;\nvar _c;\n$RefreshReg$(_c, \"TastingStartPage\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL3NyYy9hcHAvdGFzdGluZ3MvcGFnZS50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUV3QztBQUNJO0FBRTdCLFNBQVNHOztJQUN0QixNQUFNLENBQUNDLFVBQVVDLFlBQVksR0FBR0osK0NBQVFBLENBQXlCO0lBQ2pFLE1BQU0sQ0FBQ0ssT0FBT0MsU0FBUyxHQUFHTiwrQ0FBUUEsQ0FBQztJQUNuQyxNQUFNLENBQUNPLE9BQU9DLFNBQVMsR0FBR1IsK0NBQVFBLENBQ2hDO0lBRUYsTUFBTSxDQUFDUyxPQUFPQyxTQUFTLEdBQUdWLCtDQUFRQSxDQUFnQjtJQUNsRCxNQUFNVyxTQUFTViwwREFBU0E7SUFFeEIsTUFBTVcsMEJBQTBCLENBQUNDO1FBQy9CVCxZQUFZUztJQUNkO0lBRUEsTUFBTUMsdUJBQXVCLENBQUNDO1FBQzVCUCxTQUFTTztJQUNYO0lBRUEsTUFBTUMscUJBQXFCO1FBQ3pCLElBQUksQ0FBQ2IsVUFBVTtZQUNiYyxNQUFNO1lBQ047UUFDRjtRQUVBLElBQUk7WUFDRixNQUFNQyxXQUFXLE1BQU1DLE1BQU0saUJBQWlCO2dCQUM1Q0MsUUFBUTtnQkFDUkMsU0FBUztvQkFBRSxnQkFBZ0I7Z0JBQW1CO2dCQUM5Q0MsTUFBTUMsS0FBS0MsU0FBUyxDQUFDO29CQUNuQnJCO29CQUNBc0IsY0FBY2xCLFVBQVU7b0JBQ3hCbUIsZUFBZW5CLFVBQVUsYUFBYUEsUUFBUTtnQkFDaEQ7WUFDRjtZQUVBLElBQUksQ0FBQ1csU0FBU1MsRUFBRSxFQUFFO2dCQUNoQixNQUFNQyxZQUFZLE1BQU1WLFNBQVNXLElBQUk7Z0JBQ3JDbkIsU0FBU2tCLFVBQVVuQixLQUFLLElBQUk7Z0JBQzVCO1lBQ0Y7WUFFQSxpQ0FBaUM7WUFDakNFLE9BQU9tQixJQUFJLENBQUMsYUFBb0MsT0FBdkIzQixTQUFTNEIsV0FBVztRQUMvQyxFQUFFLE9BQU9DLEtBQUs7WUFDWkMsUUFBUXhCLEtBQUssQ0FBQywyQkFBMkJ1QjtZQUN6Q3RCLFNBQVM7UUFDWDtJQUNGO0lBRUEscUJBQ0UsOERBQUN3QjtRQUFLQyxXQUFVOzswQkFDZCw4REFBQ0M7Z0JBQVFELFdBQVU7O2tDQUNqQiw4REFBQ0U7a0NBQUc7Ozs7OztrQ0FDSiw4REFBQ0M7d0JBQ0NDLFNBQVMsSUFBTTNCLHdCQUF3Qjt3QkFDdkN1QixXQUFXaEMsYUFBYSxVQUFVLGFBQWE7a0NBQ2hEOzs7Ozs7a0NBR0QsOERBQUNtQzt3QkFDQ0MsU0FBUyxJQUFNM0Isd0JBQXdCO3dCQUN2Q3VCLFdBQVdoQyxhQUFhLFFBQVEsYUFBYTtrQ0FDOUM7Ozs7Ozs7Ozs7OzswQkFLSCw4REFBQ2lDO2dCQUFRRCxXQUFVOztrQ0FDakIsOERBQUNFO2tDQUFHOzs7Ozs7a0NBQ0osOERBQUNHO3dCQUFJTCxXQUFVOzswQ0FDYiw4REFBQ007MENBQU07Ozs7OzswQ0FDUCw4REFBQ0g7Z0NBQU9DLFNBQVMsSUFBTWpDLFNBQVMsQ0FBQ29DLE9BQVMsQ0FBQ0E7MENBQ3hDckMsUUFBUSxPQUFPOzs7Ozs7Ozs7Ozs7a0NBR3BCLDhEQUFDbUM7d0JBQUlMLFdBQVU7OzBDQUNiLDhEQUFDTTswQ0FBTTs7Ozs7OzBDQUNQLDhEQUFDSDtnQ0FDQ0MsU0FBUyxJQUFNekIscUJBQXFCO2dDQUNwQ3FCLFdBQVc1QixVQUFVLFlBQVksYUFBYTswQ0FDL0M7Ozs7OzswQ0FHRCw4REFBQytCO2dDQUNDQyxTQUFTLElBQU16QixxQkFBcUI7Z0NBQ3BDcUIsV0FBVzVCLFVBQVUsVUFBVSxhQUFhOzBDQUM3Qzs7Ozs7OzBDQUdELDhEQUFDK0I7Z0NBQ0NDLFNBQVMsSUFBTXpCLHFCQUFxQjtnQ0FDcENxQixXQUFXNUIsVUFBVSxhQUFhLGFBQWE7MENBQ2hEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFNSkUsdUJBQVMsOERBQUNrQztnQkFBRVIsV0FBVTswQkFBUzFCOzs7Ozs7MEJBRWhDLDhEQUFDNkI7Z0JBQU9ILFdBQVU7Z0JBQVlJLFNBQVN2QjswQkFBb0I7Ozs7Ozs7Ozs7OztBQUtqRTtHQXhHd0JkOztRQU9QRCxzREFBU0E7OztLQVBGQyIsInNvdXJjZXMiOlsiL1VzZXJzL21hcmlzaGFkZXJvdWJhaXgvYmxpbmQtdGFzdGluZy1hcHAvc3JjL2FwcC90YXN0aW5ncy9wYWdlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBjbGllbnRcIjtcblxuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyB1c2VSb3V0ZXIgfSBmcm9tIFwibmV4dC9uYXZpZ2F0aW9uXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFRhc3RpbmdTdGFydFBhZ2UoKSB7XG4gIGNvbnN0IFt3aW5lVHlwZSwgc2V0V2luZVR5cGVdID0gdXNlU3RhdGU8XCJXaGl0ZVwiIHwgXCJSZWRcIiB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbc291bmQsIHNldFNvdW5kXSA9IHVzZVN0YXRlKHRydWUpO1xuICBjb25zdCBbdGltZXIsIHNldFRpbWVyXSA9IHVzZVN0YXRlPFwiNy41IG1pblwiIHwgXCI0IG1pblwiIHwgXCJObyBUaW1lclwiIHwgbnVsbD4oXG4gICAgbnVsbFxuICApO1xuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuICBjb25zdCByb3V0ZXIgPSB1c2VSb3V0ZXIoKTtcblxuICBjb25zdCBoYW5kbGVXaW5lVHlwZVNlbGVjdGlvbiA9ICh0eXBlOiBcIldoaXRlXCIgfCBcIlJlZFwiKSA9PiB7XG4gICAgc2V0V2luZVR5cGUodHlwZSk7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlVGltZXJTZWxlY3Rpb24gPSAoZHVyYXRpb246IFwiNy41IG1pblwiIHwgXCI0IG1pblwiIHwgXCJObyBUaW1lclwiKSA9PiB7XG4gICAgc2V0VGltZXIoZHVyYXRpb24pO1xuICB9O1xuXG4gIGNvbnN0IGhhbmRsZVN0YXJ0VGFzdGluZyA9IGFzeW5jICgpID0+IHtcbiAgICBpZiAoIXdpbmVUeXBlKSB7XG4gICAgICBhbGVydChcIlBsZWFzZSBzZWxlY3QgYSB3aW5lIHR5cGUuXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFwiL2FwaS90YXN0aW5nc1wiLCB7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIHdpbmVUeXBlLFxuICAgICAgICAgIHRpbWVyRW5hYmxlZDogdGltZXIgIT09IFwiTm8gVGltZXJcIixcbiAgICAgICAgICB0aW1lckR1cmF0aW9uOiB0aW1lciAhPT0gXCJObyBUaW1lclwiID8gdGltZXIgOiBudWxsLFxuICAgICAgICB9KSxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIGNvbnN0IGVycm9yRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgc2V0RXJyb3IoZXJyb3JEYXRhLmVycm9yIHx8IFwiRmFpbGVkIHRvIHNhdmUgdGFzdGluZy5cIik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gUmVkaXJlY3QgdG8gdGhlIHdpbmUgdHlwZSBwYWdlXG4gICAgICByb3V0ZXIucHVzaChgL3Rhc3RpbmdzLyR7d2luZVR5cGUudG9Mb3dlckNhc2UoKX1gKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBzdGFydGluZyB0YXN0aW5nOlwiLCBlcnIpO1xuICAgICAgc2V0RXJyb3IoXCJBbiB1bmV4cGVjdGVkIGVycm9yIG9jY3VycmVkLlwiKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8bWFpbiBjbGFzc05hbWU9XCJ0YXN0aW5nLXN0YXJ0XCI+XG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ3aW5lLXR5cGVcIj5cbiAgICAgICAgPGgyPlNlbGVjdCBXaW5lIFR5cGU8L2gyPlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgb25DbGljaz17KCkgPT4gaGFuZGxlV2luZVR5cGVTZWxlY3Rpb24oXCJXaGl0ZVwiKX1cbiAgICAgICAgICBjbGFzc05hbWU9e3dpbmVUeXBlID09PSBcIldoaXRlXCIgPyBcInNlbGVjdGVkXCIgOiBcIlwifVxuICAgICAgICA+XG4gICAgICAgICAgV2hpdGVcbiAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBoYW5kbGVXaW5lVHlwZVNlbGVjdGlvbihcIlJlZFwiKX1cbiAgICAgICAgICBjbGFzc05hbWU9e3dpbmVUeXBlID09PSBcIlJlZFwiID8gXCJzZWxlY3RlZFwiIDogXCJcIn1cbiAgICAgICAgPlxuICAgICAgICAgIFJlZFxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwib3B0aW9uc1wiPlxuICAgICAgICA8aDI+T3B0aW9uczwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwib3B0aW9uXCI+XG4gICAgICAgICAgPGxhYmVsPlNvdW5kPC9sYWJlbD5cbiAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldFNvdW5kKChwcmV2KSA9PiAhcHJldil9PlxuICAgICAgICAgICAge3NvdW5kID8gXCJPblwiIDogXCJPZmZcIn1cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwib3B0aW9uXCI+XG4gICAgICAgICAgPGxhYmVsPlRpbWVyPC9sYWJlbD5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBoYW5kbGVUaW1lclNlbGVjdGlvbihcIjcuNSBtaW5cIil9XG4gICAgICAgICAgICBjbGFzc05hbWU9e3RpbWVyID09PSBcIjcuNSBtaW5cIiA/IFwic2VsZWN0ZWRcIiA6IFwiXCJ9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgNy41IG1pblxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGhhbmRsZVRpbWVyU2VsZWN0aW9uKFwiNCBtaW5cIil9XG4gICAgICAgICAgICBjbGFzc05hbWU9e3RpbWVyID09PSBcIjQgbWluXCIgPyBcInNlbGVjdGVkXCIgOiBcIlwifVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDQgbWluXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gaGFuZGxlVGltZXJTZWxlY3Rpb24oXCJObyBUaW1lclwiKX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT17dGltZXIgPT09IFwiTm8gVGltZXJcIiA/IFwic2VsZWN0ZWRcIiA6IFwiXCJ9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgTm8gVGltZXJcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIHtlcnJvciAmJiA8cCBjbGFzc05hbWU9XCJlcnJvclwiPntlcnJvcn08L3A+fVxuXG4gICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cInN0YXJ0LWJ0blwiIG9uQ2xpY2s9e2hhbmRsZVN0YXJ0VGFzdGluZ30+XG4gICAgICAgIFN0YXJ0IFRhc3RpbmdcbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvbWFpbj5cbiAgKTtcbn1cbiJdLCJuYW1lcyI6WyJSZWFjdCIsInVzZVN0YXRlIiwidXNlUm91dGVyIiwiVGFzdGluZ1N0YXJ0UGFnZSIsIndpbmVUeXBlIiwic2V0V2luZVR5cGUiLCJzb3VuZCIsInNldFNvdW5kIiwidGltZXIiLCJzZXRUaW1lciIsImVycm9yIiwic2V0RXJyb3IiLCJyb3V0ZXIiLCJoYW5kbGVXaW5lVHlwZVNlbGVjdGlvbiIsInR5cGUiLCJoYW5kbGVUaW1lclNlbGVjdGlvbiIsImR1cmF0aW9uIiwiaGFuZGxlU3RhcnRUYXN0aW5nIiwiYWxlcnQiLCJyZXNwb25zZSIsImZldGNoIiwibWV0aG9kIiwiaGVhZGVycyIsImJvZHkiLCJKU09OIiwic3RyaW5naWZ5IiwidGltZXJFbmFibGVkIiwidGltZXJEdXJhdGlvbiIsIm9rIiwiZXJyb3JEYXRhIiwianNvbiIsInB1c2giLCJ0b0xvd2VyQ2FzZSIsImVyciIsImNvbnNvbGUiLCJtYWluIiwiY2xhc3NOYW1lIiwic2VjdGlvbiIsImgyIiwiYnV0dG9uIiwib25DbGljayIsImRpdiIsImxhYmVsIiwicHJldiIsInAiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(app-pages-browser)/./src/app/tastings/page.tsx\n"));

/***/ })

});