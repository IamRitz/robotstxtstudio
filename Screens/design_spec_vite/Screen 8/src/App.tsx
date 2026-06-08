import { useEffect } from "react";
import {
  AlertTriangle,
  AlignLeft,
  BookOpen,
  Bot,
  CheckCircle2,
  Circle,
  Code2,
  Download,
  Eye,
  FileText,
  Globe,
  Info,
  Laptop,
  Layers,
  LayoutDashboard,
  LayoutTemplate,
  Minimize2,
  Monitor,
  MousePointerClick,
  Navigation,
  PackageOpen,
  Palette,
  Ruler,
  Search,
  SearchX,
  ShieldCheck,
  ShieldOff,
  Smartphone,
  Square,
  Table,
  Tablet,
  Tag,
  Terminal,
  ToggleLeft,
  Type,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react";

export default function App() {
  return (
    <div>
      <div className="bg-white text-neutral-950 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="mx-auto p-12 w-285">
          <div className="flex mb-2 items-center gap-2">
            <span className="font-semibold uppercase text-neutral-400 text-xs leading-4 tracking-widest">
              RobotsKit
            </span>
            <span className="text-neutral-300 text-xs leading-4">/</span>
            <span className="font-semibold uppercase text-neutral-400 text-xs leading-4 tracking-widest">
              Design System
            </span>
          </div>
          <div className="mb-10">
            <h1 className="font-bold text-neutral-950 text-4xl leading-10 tracking-tight mb-2">
              Design Specification
            </h1>
            <p className="text-neutral-500 text-sm leading-5">
              Engineering handoff document for the RobotsKit design system. Last
              updated January 2025.
            </p>
          </div>
          <div className="grid grid-cols-3 mb-8 gap-6">
            <div className="col-span-3 rounded-xl bg-neutral-950 p-6">
              <div className="flex mb-4 items-center gap-2">
                <Layers className="size-4 text-neutral-400" />
                <span className="font-semibold uppercase text-neutral-400 text-xs leading-4 tracking-widest">
                  Design Principles
                </span>
              </div>
              <div className="grid grid-cols-5 gap-4">
                <div className="rounded-lg bg-neutral-900 p-4">
                  <div className="rounded-lg bg-blue-600 flex mb-3 justify-center items-center w-8 h-8">
                    <Minimize2 className="size-4 text-white" />
                  </div>
                  <p className="font-semibold text-white text-sm leading-5 mb-1">
                    Minimalist
                  </p>
                  <p className="text-neutral-400 text-xs leading-4">
                    Remove visual noise. Every element must earn its place.
                  </p>
                </div>
                <div className="rounded-lg bg-neutral-900 p-4">
                  <div className="rounded-lg bg-neutral-700 flex mb-3 justify-center items-center w-8 h-8">
                    <Code2 className="size-4 text-white" />
                  </div>
                  <p className="font-semibold text-white text-sm leading-5 mb-1">
                    Developer-First
                  </p>
                  <p className="text-neutral-400 text-xs leading-4">
                    Monospace code, semantic labels, technical precision.
                  </p>
                </div>
                <div className="rounded-lg bg-neutral-900 p-4">
                  <div className="rounded-lg bg-neutral-700 flex mb-3 justify-center items-center w-8 h-8">
                    <ShieldCheck className="size-4 text-white" />
                  </div>
                  <p className="font-semibold text-white text-sm leading-5 mb-1">
                    Trustworthy
                  </p>
                  <p className="text-neutral-400 text-xs leading-4">
                    Consistent, predictable, and honest UI patterns.
                  </p>
                </div>
                <div className="rounded-lg bg-neutral-900 p-4">
                  <div className="rounded-lg bg-neutral-700 flex mb-3 justify-center items-center w-8 h-8">
                    <AlignLeft className="size-4 text-white" />
                  </div>
                  <p className="font-semibold text-white text-sm leading-5 mb-1">
                    Hierarchy
                  </p>
                  <p className="text-neutral-400 text-xs leading-4">
                    Strong typographic scale. Outside-in spacing principle.
                  </p>
                </div>
                <div className="rounded-lg bg-neutral-900 p-4">
                  <div className="rounded-lg bg-neutral-700 flex mb-3 justify-center items-center w-8 h-8">
                    <Zap className="size-4 text-white" />
                  </div>
                  <p className="font-semibold text-white text-sm leading-5 mb-1">
                    Purposeful Color
                  </p>
                  <p className="text-neutral-400 text-xs leading-4">
                    80% gray, 15% blue accent, 5% semantic status only.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 mb-6 gap-6">
            <div className="shadow-sm rounded-xl bg-white border-neutral-200 border-1 border-solid p-6">
              <div className="flex mb-4 items-center gap-2">
                <Palette className="size-4 text-neutral-400" />
                <span className="font-semibold uppercase text-neutral-400 text-xs leading-4 tracking-widest">
                  Color Palette
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-neutral-950 border-neutral-200 border-1 border-solid w-8 h-8" />
                  <div>
                    <p className="font-semibold text-neutral-900 text-xs leading-4">
                      neutral-950
                    </p>
                    <p className="text-neutral-400 text-xs leading-4">
                      Headings, primary text
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-neutral-700 border-neutral-200 border-1 border-solid w-8 h-8" />
                  <div>
                    <p className="font-semibold text-neutral-900 text-xs leading-4">
                      neutral-700
                    </p>
                    <p className="text-neutral-400 text-xs leading-4">
                      Body text, labels
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-neutral-500 border-neutral-200 border-1 border-solid w-8 h-8" />
                  <div>
                    <p className="font-semibold text-neutral-900 text-xs leading-4">
                      neutral-500
                    </p>
                    <p className="text-neutral-400 text-xs leading-4">
                      Secondary / muted text
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-neutral-400 border-neutral-200 border-1 border-solid w-8 h-8" />
                  <div>
                    <p className="font-semibold text-neutral-900 text-xs leading-4">
                      neutral-400
                    </p>
                    <p className="text-neutral-400 text-xs leading-4">
                      Section labels, captions
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-neutral-200 border-neutral-200 border-1 border-solid w-8 h-8" />
                  <div>
                    <p className="font-semibold text-neutral-900 text-xs leading-4">
                      neutral-200
                    </p>
                    <p className="text-neutral-400 text-xs leading-4">
                      Borders, dividers
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-neutral-100 border-neutral-200 border-1 border-solid w-8 h-8" />
                  <div>
                    <p className="font-semibold text-neutral-900 text-xs leading-4">
                      neutral-100
                    </p>
                    <p className="text-neutral-400 text-xs leading-4">
                      Subtle surfaces, chips
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white border-neutral-200 border-1 border-solid w-8 h-8" />
                  <div>
                    <p className="font-semibold text-neutral-900 text-xs leading-4">
                      white
                    </p>
                    <p className="text-neutral-400 text-xs leading-4">
                      Card backgrounds, page bg
                    </p>
                  </div>
                </div>
                <div className="bg-neutral-100 my-1 w-full h-px" />
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-600 border-neutral-200 border-1 border-solid w-8 h-8" />
                  <div>
                    <p className="font-semibold text-neutral-900 text-xs leading-4">
                      blue-600
                    </p>
                    <p className="text-neutral-400 text-xs leading-4">
                      Primary CTA, active states, links
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 border-neutral-200 border-1 border-solid w-8 h-8" />
                  <div>
                    <p className="font-semibold text-neutral-900 text-xs leading-4">
                      blue-50
                    </p>
                    <p className="text-neutral-400 text-xs leading-4">
                      Info panel backgrounds
                    </p>
                  </div>
                </div>
                <div className="bg-neutral-100 my-1 w-full h-px" />
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-600 border-neutral-200 border-1 border-solid w-8 h-8" />
                  <div>
                    <p className="font-semibold text-neutral-900 text-xs leading-4">
                      green-600 / green-50
                    </p>
                    <p className="text-neutral-400 text-xs leading-4">
                      Allowed / Success status
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-600 border-neutral-200 border-1 border-solid w-8 h-8" />
                  <div>
                    <p className="font-semibold text-neutral-900 text-xs leading-4">
                      red-600 / red-50
                    </p>
                    <p className="text-neutral-400 text-xs leading-4">
                      Blocked / Error status
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500 border-neutral-200 border-1 border-solid w-8 h-8" />
                  <div>
                    <p className="font-semibold text-neutral-900 text-xs leading-4">
                      amber-500 / amber-50
                    </p>
                    <p className="text-neutral-400 text-xs leading-4">
                      Warning status
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="shadow-sm rounded-xl bg-white border-neutral-200 border-1 border-solid p-6">
              <div className="flex mb-4 items-center gap-2">
                <Type className="size-4 text-neutral-400" />
                <span className="font-semibold uppercase text-neutral-400 text-xs leading-4 tracking-widest">
                  Typography Scale
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="border-neutral-100 border-t-0 border-r-0 border-b-1 border-l-0 border-solid pb-3">
                  <p className="leading-none font-bold text-neutral-950 text-4xl leading-10 tracking-tight">
                    Display
                  </p>
                  <p className="text-neutral-400 text-xs leading-4 mt-1">
                    text-4xl / font-bold / tracking-tight — Page titles
                  </p>
                </div>
                <div className="border-neutral-100 border-t-0 border-r-0 border-b-1 border-l-0 border-solid pb-3">
                  <p className="leading-none font-bold text-neutral-950 text-2xl leading-8 tracking-tight">
                    Heading 1
                  </p>
                  <p className="text-neutral-400 text-xs leading-4 mt-1">
                    text-2xl / font-bold / tracking-tight — Section headers
                  </p>
                </div>
                <div className="border-neutral-100 border-t-0 border-r-0 border-b-1 border-l-0 border-solid pb-3">
                  <p className="leading-none font-semibold text-neutral-950 text-lg leading-7">
                    Heading 2
                  </p>
                  <p className="text-neutral-400 text-xs leading-4 mt-1">
                    text-lg / font-semibold — Card titles
                  </p>
                </div>
                <div className="border-neutral-100 border-t-0 border-r-0 border-b-1 border-l-0 border-solid pb-3">
                  <p className="leading-none font-semibold text-neutral-900 text-sm leading-5">
                    Heading 3
                  </p>
                  <p className="text-neutral-400 text-xs leading-4 mt-1">
                    text-sm / font-semibold — Row labels, item names
                  </p>
                </div>
                <div className="border-neutral-100 border-t-0 border-r-0 border-b-1 border-l-0 border-solid pb-3">
                  <p className="leading-none text-neutral-700 text-sm leading-5">
                    Body
                  </p>
                  <p className="text-neutral-400 text-xs leading-4 mt-1">
                    text-sm / normal — Descriptions, body copy
                  </p>
                </div>
                <div className="border-neutral-100 border-t-0 border-r-0 border-b-1 border-l-0 border-solid pb-3">
                  <p className="leading-none text-neutral-500 text-xs leading-4">
                    Caption
                  </p>
                  <p className="text-neutral-400 text-xs leading-4 mt-1">
                    text-xs / normal — Secondary info, hints
                  </p>
                </div>
                <div className="border-neutral-100 border-t-0 border-r-0 border-b-1 border-l-0 border-solid pb-3">
                  <p className="leading-none font-semibold uppercase text-neutral-400 text-xs leading-4 tracking-widest">
                    SECTION LABEL
                  </p>
                  <p className="text-neutral-400 text-xs leading-4 mt-1">
                    text-xs / font-semibold / tracking-widest / uppercase
                  </p>
                </div>
                <div>
                  <p className="leading-none font-mono text-neutral-700 text-sm leading-5">
                    User-agent: Googlebot
                  </p>
                  <p className="text-neutral-400 text-xs leading-4 mt-1">
                    font-mono / text-sm — Code, paths, directives
                  </p>
                </div>
              </div>
            </div>
            <div className="shadow-sm rounded-xl bg-white border-neutral-200 border-1 border-solid p-6">
              <div className="flex mb-4 items-center gap-2">
                <Ruler className="size-4 text-neutral-400" />
                <span className="font-semibold uppercase text-neutral-400 text-xs leading-4 tracking-widest">
                  Spacing System
                </span>
              </div>
              <div className="flex mb-4 flex-col gap-2">
                <p className="font-semibold text-neutral-700 text-xs leading-4 mb-1">
                  Base unit: 4px (0.25rem)
                </p>
                <div className="flex items-center gap-3">
                  <div className="rounded-sm bg-blue-600 w-1 h-4" />
                  <p className="text-neutral-600 text-xs leading-4">
                    space-1 — 4px — Icon gaps, tight inline
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-sm bg-blue-600 w-2 h-4" />
                  <p className="text-neutral-600 text-xs leading-4">
                    space-2 — 8px — Compact row gaps
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-sm bg-blue-600 w-4 h-4" />
                  <p className="text-neutral-600 text-xs leading-4">
                    space-4 — 16px — Default gap, inner padding
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-sm bg-blue-600 w-6 h-4" />
                  <p className="text-neutral-600 text-xs leading-4">
                    space-6 — 24px — Card padding, section gap
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-sm bg-blue-600 w-8 h-4" />
                  <p className="text-neutral-600 text-xs leading-4">
                    space-8 — 32px — Page section spacing
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-sm bg-blue-600 w-12 h-4" />
                  <p className="text-neutral-600 text-xs leading-4">
                    space-12 — 48px — Page horizontal padding
                  </p>
                </div>
              </div>
              <div className="bg-neutral-100 my-3 w-full h-px" />
              <div className="flex mb-2 items-center gap-2">
                <LayoutTemplate className="size-3 text-neutral-400" />
                <p className="font-semibold text-neutral-700 text-xs leading-4">
                  Outside-In Principle
                </p>
              </div>
              <p className="text-neutral-500 text-xs leading-4 mb-2">
                Outer containers use larger spacing; inner elements use smaller
                spacing. Never invert this hierarchy.
              </p>
              <div className="rounded-lg bg-neutral-50 border-neutral-200 border-1 border-solid p-3">
                <p className="font-mono text-neutral-600 text-xs leading-4">
                  Page: px-12 py-12
                </p>
                <p className="font-mono text-neutral-600 text-xs leading-4">
                  Card: p-6 gap-4
                </p>
                <p className="font-mono text-neutral-600 text-xs leading-4">
                  CardHeader: p-0 gap-2
                </p>
                <p className="font-mono text-neutral-600 text-xs leading-4">
                  CardContent: p-0 gap-2
                </p>
                <p className="font-mono text-neutral-600 text-xs leading-4">
                  Row items: gap-2 or gap-1
                </p>
              </div>
              <div className="bg-neutral-100 my-3 w-full h-px" />
              <div className="flex mb-2 items-center gap-2">
                <Circle className="size-3 text-neutral-400" />
                <p className="font-semibold text-neutral-700 text-xs leading-4">
                  Border Radius
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <div className="rounded-sm bg-neutral-200 w-6 h-4" />
                  <p className="text-neutral-600 text-xs leading-4">
                    rounded-sm — Badges, chips, tags
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-neutral-200 w-6 h-4" />
                  <p className="text-neutral-600 text-xs leading-4">
                    rounded-lg — Buttons, inputs, small cards
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-neutral-200 w-6 h-4" />
                  <p className="text-neutral-600 text-xs leading-4">
                    rounded-xl — Cards, panels, modals
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-neutral-200 w-6 h-4" />
                  <p className="text-neutral-600 text-xs leading-4">
                    rounded-full — Pills, avatars, dots
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 mb-6 gap-6">
            <div className="shadow-sm rounded-xl bg-white border-neutral-200 border-1 border-solid p-6">
              <div className="flex mb-4 items-center gap-2">
                <Navigation className="size-4 text-neutral-400" />
                <span className="font-semibold uppercase text-neutral-400 text-xs leading-4 tracking-widest">
                  Navigation Rules
                </span>
              </div>
              <div className="rounded-xl bg-neutral-950 flex mb-4 px-6 py-3 justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-blue-600 flex justify-center items-center w-6 h-6">
                    <Bot className="size-3 text-white" />
                  </div>
                  <span className="font-bold text-white text-sm leading-5">
                    RobotsKit
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="rounded-md text-neutral-400 text-xs leading-4 px-3 py-1.5">
                    Dashboard
                  </span>
                  <span className="rounded-md text-neutral-400 text-xs leading-4 px-3 py-1.5">
                    Analyze
                  </span>
                  <span className="font-medium rounded-md bg-neutral-800 text-white text-xs leading-4 px-3 py-1.5">
                    Generate
                  </span>
                  <span className="rounded-md text-neutral-400 text-xs leading-4 px-3 py-1.5">
                    Validate
                  </span>
                  <span className="rounded-md text-neutral-400 text-xs leading-4 px-3 py-1.5">
                    URL Tester
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400 text-xs leading-4 px-3 py-1.5">
                    Sign In
                  </span>
                  <span className="font-medium rounded-lg bg-blue-600 text-white text-xs leading-4 px-3 py-1.5">
                    Get Started
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="rounded-lg bg-neutral-50 border-neutral-200 border-1 border-solid flex p-3 items-start gap-3">
                  <Info className="size-3 shrink-0 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-neutral-900 text-xs leading-4">
                      Top horizontal nav on dark neutral-950 bar
                    </p>
                    <p className="text-neutral-500 text-xs leading-4">
                      Logo left, nav items center, auth actions right
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-neutral-50 border-neutral-200 border-1 border-solid flex p-3 items-start gap-3">
                  <Info className="size-3 shrink-0 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-neutral-900 text-xs leading-4">
                      Active nav item
                    </p>
                    <p className="text-neutral-500 text-xs leading-4">
                      bg-neutral-800 text-white rounded-md px-3 py-1.5
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-neutral-50 border-neutral-200 border-1 border-solid flex p-3 items-start gap-3">
                  <Info className="size-3 shrink-0 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-neutral-900 text-xs leading-4">
                      Breadcrumb pattern
                    </p>
                    <p className="text-neutral-500 text-xs leading-4">
                      text-xs tracking-widest uppercase neutral-400 /
                      neutral-300 separator
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-neutral-50 border-neutral-200 border-1 border-solid flex p-3 items-start gap-3">
                  <Info className="size-3 shrink-0 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-neutral-900 text-xs leading-4">
                      Primary CTA in nav
                    </p>
                    <p className="text-neutral-500 text-xs leading-4">
                      bg-blue-600 text-white rounded-lg — "Get Started"
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="shadow-sm rounded-xl bg-white border-neutral-200 border-1 border-solid p-6">
              <div className="flex mb-4 items-center gap-2">
                <Square className="size-4 text-neutral-400" />
                <span className="font-semibold uppercase text-neutral-400 text-xs leading-4 tracking-widest">
                  Card Styles
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="shadow-sm rounded-xl border-neutral-200 border-1 border-solid p-4">
                  <div className="flex mb-2 items-center gap-2">
                    <LayoutDashboard className="size-3 text-neutral-400" />
                    <span className="font-semibold uppercase text-neutral-400 text-xs leading-4 tracking-widest">
                      Standard Card
                    </span>
                  </div>
                  <p className="text-neutral-500 text-xs leading-4">
                    bg-white border-neutral-200 rounded-xl shadow-sm p-6 gap-4
                  </p>
                </div>
                <div className="shadow-sm rounded-xl border-neutral-200 border-1 border-solid overflow-hidden">
                  <div className="bg-neutral-100 flex px-4 py-2 items-center gap-2">
                    <Bot className="size-3 text-neutral-700" />
                    <span className="font-semibold uppercase text-neutral-700 text-xs leading-4 tracking-widest">
                      Category Card Header
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-neutral-500 text-xs leading-4">
                      bg-neutral-100 header with dark icon + uppercase label.
                      Body bg-white p-4.
                    </p>
                  </div>
                </div>
                <div className="shadow-sm rounded-xl bg-blue-50 border-neutral-200 border-1 border-solid p-4">
                  <div className="flex mb-1 items-center gap-2">
                    <Zap className="size-3 text-blue-600" />
                    <span className="font-semibold text-blue-700 text-xs leading-4">
                      Info / Impact Panel
                    </span>
                  </div>
                  <p className="text-blue-600 text-xs leading-4">
                    bg-blue-50 border-l-4 border-blue-600 rounded-xl p-4
                  </p>
                </div>
                <div className="rounded-xl bg-neutral-950 p-4">
                  <div className="flex mb-1 items-center gap-2">
                    <Terminal className="size-3 text-neutral-400" />
                    <span className="font-semibold uppercase text-neutral-400 text-xs leading-4 tracking-widest">
                      Dark Code Panel
                    </span>
                  </div>
                  <p className="font-mono text-neutral-300 text-xs leading-4">
                    bg-neutral-950 rounded-xl — code blocks, rule previews
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 mb-6 gap-6">
            <div className="shadow-sm rounded-xl bg-white border-neutral-200 border-1 border-solid p-6">
              <div className="flex mb-4 items-center gap-2">
                <MousePointerClick className="size-4 text-neutral-400" />
                <span className="font-semibold uppercase text-neutral-400 text-xs leading-4 tracking-widest">
                  Component Inventory — Buttons
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <button className="font-medium rounded-lg bg-blue-600 text-white text-xs leading-4 flex px-4 py-2 items-center gap-1.5">
                    <Download className="size-3" />
                    Primary CTA
                  </button>
                  <p className="text-neutral-500 text-xs leading-4">
                    bg-blue-600 text-white rounded-lg
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="font-medium rounded-lg bg-white text-neutral-700 text-xs leading-4 border-neutral-200 border-1 border-solid flex px-4 py-2 items-center gap-1.5">
                    <Eye className="size-3" />
                    Secondary
                  </button>
                  <p className="text-neutral-500 text-xs leading-4">
                    bg-white border-neutral-200 text-neutral-700
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="font-medium rounded-lg bg-white text-blue-600 text-xs leading-4 border-blue-600 border-1 border-solid flex px-4 py-2 items-center gap-1.5">
                    <Wrench className="size-3" />
                    Blue Outline
                  </button>
                  <p className="text-neutral-500 text-xs leading-4">
                    border-blue-600 text-blue-600
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="font-medium rounded-lg bg-white text-red-600 text-xs leading-4 border-red-300 border-1 border-solid flex px-4 py-2 items-center gap-1.5">
                    <ShieldOff className="size-3" />
                    Destructive
                  </button>
                  <p className="text-neutral-500 text-xs leading-4">
                    border-red-300 text-red-600
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="cursor-pointer underline text-blue-600 text-xs leading-4">
                    Text Link
                  </span>
                  <p className="text-neutral-500 text-xs leading-4">
                    text-blue-600 underline
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="cursor-pointer underline text-neutral-500 text-xs leading-4">
                    Muted Link
                  </span>
                  <p className="text-neutral-500 text-xs leading-4">
                    text-neutral-500 underline
                  </p>
                </div>
              </div>
            </div>
            <div className="shadow-sm rounded-xl bg-white border-neutral-200 border-1 border-solid p-6">
              <div className="flex mb-4 items-center gap-2">
                <ToggleLeft className="size-4 text-neutral-400" />
                <span className="font-semibold uppercase text-neutral-400 text-xs leading-4 tracking-widest">
                  Form Styles
                </span>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="font-semibold text-neutral-700 text-xs leading-4 mb-1.5">
                    Text Input
                  </p>
                  <div className="rounded-lg bg-white border-neutral-200 border-1 border-solid flex px-3 py-2 items-center gap-2">
                    <Globe className="size-3 text-neutral-400" />
                    <span className="text-neutral-400 text-xs leading-4">
                      Enter domain — e.g. https://example.com
                    </span>
                  </div>
                  <p className="text-neutral-400 text-xs leading-4 mt-1">
                    border-neutral-200 rounded-lg px-3 py-2 text-sm
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-neutral-700 text-xs leading-4 mb-1.5">
                    Search Input
                  </p>
                  <div className="rounded-lg bg-white border-neutral-200 border-1 border-solid flex px-3 py-2 items-center gap-2">
                    <Search className="size-3 text-neutral-400" />
                    <span className="text-neutral-400 text-xs leading-4">
                      Search crawlers by name or owner...
                    </span>
                  </div>
                  <p className="text-neutral-400 text-xs leading-4 mt-1">
                    Same as text input with Search icon prefix
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-neutral-700 text-xs leading-4 mb-1.5">
                    Toggle — Allowed
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-600 flex px-0.5 justify-end items-center w-9 h-5">
                      <div className="rounded-full bg-white w-4 h-4" />
                    </div>
                    <span className="text-neutral-700 text-xs leading-4">
                      Allowed state
                    </span>
                  </div>
                  <p className="text-neutral-400 text-xs leading-4 mt-1">
                    bg-blue-600 thumb-white
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-neutral-700 text-xs leading-4 mb-1.5">
                    Toggle — Blocked
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-neutral-200 flex px-0.5 justify-start items-center w-9 h-5">
                      <div className="rounded-full bg-neutral-400 w-4 h-4" />
                    </div>
                    <span className="text-neutral-700 text-xs leading-4">
                      Blocked state
                    </span>
                  </div>
                  <p className="text-neutral-400 text-xs leading-4 mt-1">
                    bg-neutral-200 thumb-neutral-400
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-neutral-700 text-xs leading-4 mb-1.5">
                    Tab Switcher
                  </p>
                  <div className="rounded-lg bg-neutral-100 flex p-1 items-center gap-1">
                    <span className="font-medium rounded-md bg-blue-600 text-white text-xs leading-4 px-3 py-1.5">
                      Active Tab
                    </span>
                    <span className="font-medium rounded-md text-neutral-600 text-xs leading-4 px-3 py-1.5">
                      Inactive Tab
                    </span>
                  </div>
                  <p className="text-neutral-400 text-xs leading-4 mt-1">
                    Active: bg-blue-600 text-white. Inactive: text-neutral-600
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-neutral-700 text-xs leading-4 mb-1.5">
                    Underline Tab
                  </p>
                  <div className="border-neutral-200 border-t-0 border-r-0 border-b-1 border-l-0 border-solid flex pb-2 items-center gap-4">
                    <span className="font-semibold text-blue-600 text-xs leading-4 border-blue-600 border-t-0 border-r-0 border-b-2 border-l-0 border-solid -mb-2 pb-2">
                      All Issues
                    </span>
                    <span className="text-neutral-500 text-xs leading-4">
                      Errors
                    </span>
                    <span className="text-neutral-500 text-xs leading-4">
                      Warnings
                    </span>
                  </div>
                  <p className="text-neutral-400 text-xs leading-4 mt-1">
                    Active: text-blue-600 border-b-2 border-blue-600
                  </p>
                </div>
              </div>
            </div>
            <div className="shadow-sm rounded-xl bg-white border-neutral-200 border-1 border-solid p-6">
              <div className="flex mb-4 items-center gap-2">
                <Tag className="size-4 text-neutral-400" />
                <span className="font-semibold uppercase text-neutral-400 text-xs leading-4 tracking-widest">{`Status Colors & Badges`}</span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="font-semibold rounded-full bg-green-50 text-green-700 text-xs leading-4 flex px-2.5 py-1 items-center gap-2">
                    <span className="rounded-full bg-green-500 w-1.5 h-1.5" />
                    Allowed
                  </div>
                  <p className="text-neutral-400 text-xs leading-4">
                    bg-green-50 text-green-700 dot-green-500
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-semibold rounded-full bg-red-50 text-red-700 text-xs leading-4 flex px-2.5 py-1 items-center gap-2">
                    <span className="rounded-full bg-red-500 w-1.5 h-1.5" />
                    Blocked
                  </div>
                  <p className="text-neutral-400 text-xs leading-4">
                    bg-red-50 text-red-700 dot-red-500
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-semibold rounded-full bg-amber-50 text-amber-700 text-xs leading-4 flex px-2.5 py-1 items-center gap-2">
                    <span className="rounded-full bg-amber-500 w-1.5 h-1.5" />
                    Warning
                  </div>
                  <p className="text-neutral-400 text-xs leading-4">
                    bg-amber-50 text-amber-700 dot-amber-500
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-semibold rounded-full bg-blue-50 text-blue-700 text-xs leading-4 flex px-2.5 py-1 items-center gap-2">
                    <span className="rounded-full bg-blue-500 w-1.5 h-1.5" />
                    Info
                  </div>
                  <p className="text-neutral-400 text-xs leading-4">
                    bg-blue-50 text-blue-700 dot-blue-500
                  </p>
                </div>
                <div className="bg-neutral-100 my-1 w-full h-px" />
                <p className="font-semibold text-neutral-700 text-xs leading-4 mb-1">
                  Severity Badges (Filled)
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-semibold rounded-full bg-red-600 text-white text-xs leading-4 px-2.5 py-1">
                    2 Errors
                  </span>
                  <span className="font-semibold rounded-full bg-amber-50 text-amber-700 text-xs leading-4 border-amber-200 border-1 border-solid px-2.5 py-1">
                    3 Warnings
                  </span>
                  <span className="font-semibold rounded-full bg-neutral-100 text-neutral-500 text-xs leading-4 px-2.5 py-1">
                    2 Info
                  </span>
                </div>
                <div className="bg-neutral-100 my-1 w-full h-px" />
                <p className="font-semibold text-neutral-700 text-xs leading-4 mb-1">
                  Severity Icons
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-red-50 flex justify-center items-center w-6 h-6">
                      <XCircle className="size-3 text-red-600" />
                    </div>
                    <p className="text-neutral-500 text-xs leading-4">
                      Error — bg-red-50 icon-red-600
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-amber-50 flex justify-center items-center w-6 h-6">
                      <AlertTriangle className="size-3 text-amber-500" />
                    </div>
                    <p className="text-neutral-500 text-xs leading-4">
                      Warning — bg-amber-50 icon-amber-500
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-blue-50 flex justify-center items-center w-6 h-6">
                      <Info className="size-3 text-blue-600" />
                    </div>
                    <p className="text-neutral-500 text-xs leading-4">
                      Info — bg-blue-50 icon-blue-600
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-green-50 flex justify-center items-center w-6 h-6">
                      <CheckCircle2 className="size-3 text-green-600" />
                    </div>
                    <p className="text-neutral-500 text-xs leading-4">
                      Success — bg-green-50 icon-green-600
                    </p>
                  </div>
                </div>
                <div className="bg-neutral-100 my-1 w-full h-px" />
                <p className="font-semibold text-neutral-700 text-xs leading-4 mb-1">
                  Health Score Gauge Colors
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="rounded-full bg-green-500 w-3 h-3" />
                    <p className="text-neutral-500 text-xs leading-4">
                      80–100 green-500
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="rounded-full bg-amber-500 w-3 h-3" />
                    <p className="text-neutral-500 text-xs leading-4">
                      60–79 amber-500
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="rounded-full bg-red-500 w-3 h-3" />
                    <p className="text-neutral-500 text-xs leading-4">
                      0–59 red-500
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 mb-6 gap-6">
            <div className="shadow-sm rounded-xl bg-white border-neutral-200 border-1 border-solid p-6">
              <div className="flex mb-4 items-center gap-2">
                <Table className="size-4 text-neutral-400" />
                <span className="font-semibold uppercase text-neutral-400 text-xs leading-4 tracking-widest">{`Table & List Row Styles`}</span>
              </div>
              <div className="rounded-xl border-neutral-200 border-1 border-solid overflow-hidden">
                <div className="grid grid-cols-4 bg-neutral-50 border-neutral-200 border-t-0 border-r-0 border-b-1 border-l-0 border-solid px-4 py-2 gap-4">
                  <span className="font-semibold text-neutral-500 text-xs leading-4">
                    Crawler
                  </span>
                  <span className="font-semibold text-neutral-500 text-xs leading-4">
                    Owner
                  </span>
                  <span className="font-semibold text-neutral-500 text-xs leading-4">
                    User-Agent
                  </span>
                  <span className="font-semibold text-neutral-500 text-xs leading-4">
                    Status
                  </span>
                </div>
                <div className="grid grid-cols-4 border-neutral-100 border-t-0 border-r-0 border-b-1 border-l-0 border-solid px-4 py-3 items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-sm bg-neutral-100 flex justify-center items-center w-6 h-6">
                      <span className="font-bold text-neutral-700 text-xs leading-4">
                        G
                      </span>
                    </div>
                    <span className="font-semibold text-neutral-900 text-xs leading-4">
                      Googlebot
                    </span>
                  </div>
                  <span className="text-neutral-500 text-xs leading-4">
                    Google
                  </span>
                  <span className="font-mono text-neutral-600 text-xs leading-4">
                    Googlebot
                  </span>
                  <div className="font-semibold rounded-full bg-green-50 text-green-700 text-xs leading-4 flex px-2 py-0.5 items-center gap-1.5 w-fit">
                    <span className="rounded-full bg-green-500 w-1.5 h-1.5" />
                    Allowed
                  </div>
                </div>
                <div className="grid grid-cols-4 bg-neutral-50 border-neutral-100 border-t-0 border-r-0 border-b-1 border-l-0 border-solid px-4 py-3 items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-sm bg-neutral-100 flex justify-center items-center w-6 h-6">
                      <span className="font-bold text-neutral-700 text-xs leading-4">
                        OAI
                      </span>
                    </div>
                    <span className="font-semibold text-neutral-900 text-xs leading-4">
                      GPTBot
                    </span>
                  </div>
                  <span className="text-neutral-500 text-xs leading-4">
                    OpenAI
                  </span>
                  <span className="font-mono text-neutral-600 text-xs leading-4">
                    GPTBot
                  </span>
                  <div className="font-semibold rounded-full bg-red-50 text-red-700 text-xs leading-4 flex px-2 py-0.5 items-center gap-1.5 w-fit">
                    <span className="rounded-full bg-red-500 w-1.5 h-1.5" />
                    Blocked
                  </div>
                </div>
              </div>
              <div className="flex mt-4 flex-col gap-2">
                <div className="rounded-lg bg-neutral-50 border-neutral-200 border-1 border-solid flex p-3 items-start gap-3">
                  <Info className="size-3 shrink-0 text-blue-600 mt-0.5" />
                  <p className="text-neutral-600 text-xs leading-4">
                    Row hover: bg-neutral-50. Alternating rows optional.
                    Dividers: border-neutral-100.
                  </p>
                </div>
                <div className="rounded-lg bg-neutral-50 border-neutral-200 border-1 border-solid flex p-3 items-start gap-3">
                  <Info className="size-3 shrink-0 text-blue-600 mt-0.5" />
                  <p className="text-neutral-600 text-xs leading-4">
                    Brand logo tiles: w-6 h-6 rounded bg-neutral-100 with bold
                    2–3 char abbreviation in neutral-700.
                  </p>
                </div>
                <div className="rounded-lg bg-neutral-50 border-neutral-200 border-1 border-solid flex p-3 items-start gap-3">
                  <Info className="size-3 shrink-0 text-blue-600 mt-0.5" />
                  <p className="text-neutral-600 text-xs leading-4">
                    User-agent strings always in font-mono text-neutral-600.
                  </p>
                </div>
              </div>
            </div>
            <div className="shadow-sm rounded-xl bg-white border-neutral-200 border-1 border-solid p-6">
              <div className="flex mb-4 items-center gap-2">
                <PackageOpen className="size-4 text-neutral-400" />
                <span className="font-semibold uppercase text-neutral-400 text-xs leading-4 tracking-widest">
                  Empty States
                </span>
              </div>
              <div className="flex flex-col gap-4">
                <div className="text-center rounded-xl border-neutral-200 border-1 border-dashed flex p-6 flex-col justify-center items-center">
                  <div className="rounded-xl bg-neutral-100 flex mb-3 justify-center items-center w-10 h-10">
                    <SearchX className="size-5 text-neutral-400" />
                  </div>
                  <p className="font-semibold text-neutral-700 text-sm leading-5 mb-1">
                    No results found
                  </p>
                  <p className="text-neutral-400 text-xs leading-4 mb-3">
                    Try adjusting your search or filters to find what you're
                    looking for.
                  </p>
                  <button className="font-medium rounded-lg bg-white text-neutral-700 text-xs leading-4 border-neutral-200 border-1 border-solid px-3 py-1.5">
                    Clear filters
                  </button>
                </div>
                <div className="text-center rounded-xl border-neutral-200 border-1 border-dashed flex p-6 flex-col justify-center items-center">
                  <div className="rounded-xl bg-neutral-100 flex mb-3 justify-center items-center w-10 h-10">
                    <FileText className="size-5 text-neutral-400" />
                  </div>
                  <p className="font-semibold text-neutral-700 text-sm leading-5 mb-1">
                    No robots.txt detected
                  </p>
                  <p className="text-neutral-400 text-xs leading-4 mb-3">
                    Enter a domain above to fetch and analyze its robots.txt
                    file.
                  </p>
                  <button className="font-medium rounded-lg bg-blue-600 text-white text-xs leading-4 px-3 py-1.5">{`Fetch & Analyze`}</button>
                </div>
                <div className="flex mt-2 flex-col gap-2">
                  <div className="rounded-lg bg-neutral-50 border-neutral-200 border-1 border-solid flex p-3 items-start gap-3">
                    <Info className="size-3 shrink-0 text-blue-600 mt-0.5" />
                    <p className="text-neutral-600 text-xs leading-4">
                      Empty state icon: w-10 h-10 bg-neutral-100 rounded-xl with
                      neutral-400 Lucide icon.
                    </p>
                  </div>
                  <div className="rounded-lg bg-neutral-50 border-neutral-200 border-1 border-solid flex p-3 items-start gap-3">
                    <Info className="size-3 shrink-0 text-blue-600 mt-0.5" />
                    <p className="text-neutral-600 text-xs leading-4">
                      Always include a heading, a short description, and a
                      single CTA action.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="shadow-sm rounded-xl bg-white border-neutral-200 border-1 border-solid mb-6 p-6">
            <div className="flex mb-4 items-center gap-2">
              <Monitor className="size-4 text-neutral-400" />
              <span className="font-semibold uppercase text-neutral-400 text-xs leading-4 tracking-widest">
                Responsive Behavior
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-xl border-neutral-200 border-1 border-solid p-4">
                <div className="flex mb-2 items-center gap-2">
                  <Monitor className="size-4 text-blue-600" />
                  <p className="font-semibold text-neutral-900 text-xs leading-4">
                    Desktop ≥ 1140px
                  </p>
                </div>
                <p className="text-neutral-500 text-xs leading-4 mb-2">
                  Primary target. Full multi-column layouts.
                </p>
                <div className="flex flex-col gap-1">
                  <p className="font-mono text-neutral-600 text-xs leading-4">
                    px-12 py-12
                  </p>
                  <p className="font-mono text-neutral-600 text-xs leading-4">
                    grid-cols-2 / grid-cols-3
                  </p>
                  <p className="font-mono text-neutral-600 text-xs leading-4">
                    Sticky bottom action bar
                  </p>
                  <p className="font-mono text-neutral-600 text-xs leading-4">
                    Horizontal top nav
                  </p>
                </div>
              </div>
              <div className="rounded-xl border-neutral-200 border-1 border-solid p-4">
                <div className="flex mb-2 items-center gap-2">
                  <Laptop className="size-4 text-neutral-400" />
                  <p className="font-semibold text-neutral-900 text-xs leading-4">
                    Laptop 900–1139px
                  </p>
                </div>
                <p className="text-neutral-500 text-xs leading-4 mb-2">
                  Reduced columns, compressed nav.
                </p>
                <div className="flex flex-col gap-1">
                  <p className="font-mono text-neutral-600 text-xs leading-4">
                    px-8 py-8
                  </p>
                  <p className="font-mono text-neutral-600 text-xs leading-4">
                    grid-cols-2 max
                  </p>
                  <p className="font-mono text-neutral-600 text-xs leading-4">
                    Nav items may truncate
                  </p>
                  <p className="font-mono text-neutral-600 text-xs leading-4">
                    Cards stack earlier
                  </p>
                </div>
              </div>
              <div className="rounded-xl border-neutral-200 border-1 border-solid p-4">
                <div className="flex mb-2 items-center gap-2">
                  <Tablet className="size-4 text-neutral-400" />
                  <p className="font-semibold text-neutral-900 text-xs leading-4">
                    Tablet 600–899px
                  </p>
                </div>
                <p className="text-neutral-500 text-xs leading-4 mb-2">
                  Single column, hamburger nav.
                </p>
                <div className="flex flex-col gap-1">
                  <p className="font-mono text-neutral-600 text-xs leading-4">
                    px-6 py-6
                  </p>
                  <p className="font-mono text-neutral-600 text-xs leading-4">
                    grid-cols-1
                  </p>
                  <p className="font-mono text-neutral-600 text-xs leading-4">
                    Hamburger menu
                  </p>
                  <p className="font-mono text-neutral-600 text-xs leading-4">
                    Full-width cards
                  </p>
                </div>
              </div>
              <div className="rounded-xl border-neutral-200 border-1 border-solid p-4">
                <div className="flex mb-2 items-center gap-2">
                  <Smartphone className="size-4 text-neutral-400" />
                  <p className="font-semibold text-neutral-900 text-xs leading-4">{`Mobile < 600px`}</p>
                </div>
                <p className="text-neutral-500 text-xs leading-4 mb-2">
                  Single column, bottom nav bar.
                </p>
                <div className="flex flex-col gap-1">
                  <p className="font-mono text-neutral-600 text-xs leading-4">
                    px-4 py-4
                  </p>
                  <p className="font-mono text-neutral-600 text-xs leading-4">
                    grid-cols-1 only
                  </p>
                  <p className="font-mono text-neutral-600 text-xs leading-4">
                    Bottom tab bar
                  </p>
                  <p className="font-mono text-neutral-600 text-xs leading-4">
                    Collapsed sections
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="shadow-sm rounded-xl bg-white border-neutral-200 border-1 border-solid mb-6 p-6">
            <div className="flex mb-4 items-center gap-2">
              <BookOpen className="size-4 text-neutral-400" />
              <span className="font-semibold uppercase text-neutral-400 text-xs leading-4 tracking-widest">
                Component Inventory — Full List
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-lg bg-neutral-50 border-neutral-200 border-1 border-solid p-3">
                <p className="font-semibold text-neutral-900 text-xs leading-4 mb-1">
                  Navigation
                </p>
                <div className="flex flex-col gap-0.5">
                  <p className="text-neutral-500 text-xs leading-4">
                    TopNav (dark bar)
                  </p>
                  <p className="text-neutral-500 text-xs leading-4">
                    Breadcrumb
                  </p>
                  <p className="text-neutral-500 text-xs leading-4">
                    Tab Switcher (pill)
                  </p>
                  <p className="text-neutral-500 text-xs leading-4">
                    Underline Tabs
                  </p>
                  <p className="text-neutral-500 text-xs leading-4">
                    Sticky Bottom Bar
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-neutral-50 border-neutral-200 border-1 border-solid p-3">
                <p className="font-semibold text-neutral-900 text-xs leading-4 mb-1">
                  Data Display
                </p>
                <div className="flex flex-col gap-0.5">
                  <p className="text-neutral-500 text-xs leading-4">
                    Crawler Row
                  </p>
                  <p className="text-neutral-500 text-xs leading-4">
                    Category Card
                  </p>
                  <p className="text-neutral-500 text-xs leading-4">
                    SVG Gauge
                  </p>
                  <p className="text-neutral-500 text-xs leading-4">
                    Progress Bar
                  </p>
                  <p className="text-neutral-500 text-xs leading-4">
                    Mini Bar Chart
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-neutral-50 border-neutral-200 border-1 border-solid p-3">
                <p className="font-semibold text-neutral-900 text-xs leading-4 mb-1">
                  Feedback
                </p>
                <div className="flex flex-col gap-0.5">
                  <p className="text-neutral-500 text-xs leading-4">
                    Status Badge (pill)
                  </p>
                  <p className="text-neutral-500 text-xs leading-4">
                    Severity Badge
                  </p>
                  <p className="text-neutral-500 text-xs leading-4">
                    Issue Card
                  </p>
                  <p className="text-neutral-500 text-xs leading-4">
                    Info Banner
                  </p>
                  <p className="text-neutral-500 text-xs leading-4">
                    Impact Preview
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-neutral-50 border-neutral-200 border-1 border-solid p-3">
                <p className="font-semibold text-neutral-900 text-xs leading-4 mb-1">{`Forms & Actions`}</p>
                <div className="flex flex-col gap-0.5">
                  <p className="text-neutral-500 text-xs leading-4">
                    Text Input
                  </p>
                  <p className="text-neutral-500 text-xs leading-4">
                    Search Input
                  </p>
                  <p className="text-neutral-500 text-xs leading-4">
                    Toggle Switch
                  </p>
                  <p className="text-neutral-500 text-xs leading-4">
                    Preset Button
                  </p>
                  <p className="text-neutral-500 text-xs leading-4">
                    Code Editor Panel
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-neutral-50 border-neutral-200 border-1 border-solid flex p-4 justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-600 flex justify-center items-center w-8 h-8">
                <Bot className="size-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-neutral-950 text-sm leading-5">
                  RobotsKit Design System v1.0
                </p>
                <p className="text-neutral-500 text-xs leading-4">
                  Maintained by the RobotsKit product team. For questions
                  contact design@robotskit.com
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 text-xs leading-4">Figma</span>
              <span className="text-neutral-300 text-xs leading-4">·</span>
              <span className="text-neutral-400 text-xs leading-4">
                Storybook
              </span>
              <span className="text-neutral-300 text-xs leading-4">·</span>
              <span className="text-neutral-400 text-xs leading-4">GitHub</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
