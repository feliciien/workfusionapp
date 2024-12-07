"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var zod_1 = require("@hookform/resolvers/zod");
var axios_1 = require("axios");
var lucide_react_1 = require("lucide-react");
var navigation_1 = require("next/navigation");
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var empty_1 = require("@/components/empty");
var heading_1 = require("@/components/heading");
var loader_1 = require("@/components/loader");
var button_1 = require("@/components/ui/button");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var use_pro_modal_1 = require("@/hooks/use-pro-modal");
var react_hot_toast_1 = require("react-hot-toast");
var constants_1 = require("./constants");
var MusicPage = function () {
    var router = (0, navigation_1.useRouter)();
    var proModal = (0, use_pro_modal_1.default)();
    var _a = (0, react_1.useState)(""), music = _a[0], setMusic = _a[1];
    var form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(constants_1.formSchema),
        defaultValues: {
            prompt: "",
        },
    });
    var isLoading = form.formState.isSubmitting;
    var onSubmit = function (values) { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    setMusic("");
                    return [4 /*yield*/, axios_1.default.post("/api/music", {
                            prompt: values.prompt,
                        })];
                case 1:
                    response = _b.sent();
                    setMusic(response.data.audio);
                    form.reset();
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _b.sent();
                    console.error(error_1);
                    if (((_a = error_1 === null || error_1 === void 0 ? void 0 : error_1.response) === null || _a === void 0 ? void 0 : _a.status) === 403) {
                        // If your backend enforces usage limits or auth, open the Pro Modal
                        proModal.onOpen();
                    }
                    else {
                        react_hot_toast_1.toast.error("Something went wrong generating the music.");
                    }
                    return [3 /*break*/, 4];
                case 3:
                    router.refresh();
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (<div>
      <heading_1.Heading title="Music Generation" description="Generate AI-driven music based on your prompt." icon={lucide_react_1.Music} iconColor="text-emerald-500" bgColor="bg-emerald-500/10"/>
      <div className="px-4 lg:px-8">
        <div>
          <form_1.Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2">
              <form_1.FormField name="prompt" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="col-span-12 lg:col-span-10">
                    <form_1.FormControl className="m-0 p-0">
                      <input_1.Input {...field} placeholder="Describe the type of music you want..." className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent" disabled={isLoading}/>
                    </form_1.FormControl>
                  </form_1.FormItem>);
        }}/>
              <button_1.Button className="col-span-12 lg:col-span-2 w-full" disabled={isLoading}>
                {isLoading ? "Generating..." : "Generate"}
              </button_1.Button>
            </form>
          </form_1.Form>
        </div>
        <div className="space-y-4 mt-4">
          {isLoading && (<div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <loader_1.Loader />
            </div>)}
          {!music && !isLoading && (<empty_1.Empty label="Enter a prompt and generate music."/>)}
          {music && (<audio controls className="w-full mt-8">
              <source src={music} type="audio/mpeg"/>
              Your browser does not support the audio element.
            </audio>)}
        </div>
      </div>
    </div>);
};
exports.default = MusicPage;
