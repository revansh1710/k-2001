
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Grid, GridColumn, GridNoRecords } from "@progress/kendo-react-grid";
import { process, type State as DataState, type DataResult } from "@progress/kendo-data-query";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip as ReTooltip,
    CartesianGrid,
} from "recharts";

import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import {
    TabStrip,
    TabStripTab,
    TileLayout,
    type TileLayoutRepositionEvent,
    AppBar,
    Card,
    Avatar,
} from "@progress/kendo-react-layout";

import { DatePicker } from "@progress/kendo-react-dateinputs";
import { DropDownList, AutoComplete } from "@progress/kendo-react-dropdowns";
import { Slider } from "@progress/kendo-react-inputs";
import { ProgressBar } from "@progress/kendo-react-progressbars";
import { Skeleton } from "@progress/kendo-react-indicators";
import QuizPanel from "./QuizPanel";
import ApodPanel from "./ApodPanel";
/* ---------------------------------- types --------------------------------- */
type StrapiPlanet = {
    id: number | string;
    name?: string;
    radius_km?: number | null;
    orbit_radius_km?: string | number | null;
    mass_kg?: string | number | null;
    gravity_m_s2?: number | null;
    density_kg_m3?: number | null;
    description?: string | null;
};

/* ---------------------------------- utils --------------------------------- */
const safeNumber = (v: any): number | null => {
    if (v === null || v === undefined || v === "") return null;
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    const n = Number(String(v));
    return Number.isFinite(n) ? n : null;
};

const formatMass = (mass: any) => {
    if (mass == null) return "—";
    if (typeof mass === "string") {
        const parsed = Number(mass);
        return Number.isFinite(parsed) ? `${parsed.toExponential(3)} kg` : `${mass} kg`;
    }
    if (typeof mass === "number") return `${mass.toExponential(3)} kg`;
    return String(mass);
};

/** localStorage-backed state */
const usePersistentState = <T,>(key: string, initial: T) => {
    const [state, setState] = useState<T>(() => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? (JSON.parse(raw) as T) : initial;
        } catch {
            return initial;
        }
    });
    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch {
            /* ignore */
        }
    }, [key, state]);
    return [state, setState] as const;
};

/* --------------------------- Orbit visualization --------------------------- */
const OrbitViz: React.FC<{ planets: StrapiPlanet[]; t: number; size?: number }> = ({
    planets,
    t,
    size = 420,
}) => {
    const center = size / 2;
    const padding = 28;
    const orbitNums = planets.map((p) => Math.max(0, safeNumber(p.orbit_radius_km) ?? 0));
    const maxOrbit = Math.max(...orbitNums, 1);
    const maxDrawableR = center - padding;
    const palette = ["#f97316", "#06b6d4", "#60a5fa", "#f472b6", "#a78bfa", "#34d399"];

    const mapOrbitToPx = (orbitKm: number) => {
        if (!orbitKm || maxOrbit === 0) return Math.max(20, maxDrawableR * 0.2);
        const norm = Math.sqrt(orbitKm) / Math.sqrt(maxOrbit);
        return 20 + norm * (maxDrawableR - 20);
        // sqrt scaling compresses huge ranges, keeps inner planets readable
    };

    return (
        <svg width={size} height={size} role="img" aria-label="Orbit visualization" className="block">
            <defs>
                <radialGradient id="sunGrad" cx="50%" cy="50%">
                    <stop offset="0%" stopColor="#fff6bf" />
                    <stop offset="60%" stopColor="#ffd66b" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="#ff8a1a" stopOpacity={0.25} />
                </radialGradient>
                <filter id="softGlow">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <rect x="0" y="0" width={size} height={size} fill="transparent" />

            {/* Sun */}
            <circle cx={center} cy={center} r={12} fill="url(#sunGrad)" filter="url(#softGlow)" />

            {/* Orbits */}
            {planets.map((p, i) => {
                const orbitKm = Math.max(0, safeNumber(p.orbit_radius_km) ?? 0);
                const r = mapOrbitToPx(orbitKm || (i + 1) * (maxOrbit / (planets.length || 1)));
                return (
                    <circle
                        key={`orbit-${p.id ?? i}`}
                        cx={center}
                        cy={center}
                        r={r}
                        fill="none"
                        stroke="rgba(176,199,255,0.18)"
                        strokeDasharray="4 8"
                    />
                );
            })}

            {/* Planets */}
            {planets.map((p, i) => {
                const orbitKm = Math.max(0, safeNumber(p.orbit_radius_km) ?? 0);
                const r = mapOrbitToPx(orbitKm || (i + 1) * (maxOrbit / (planets.length || 1)));
                const normOrbit = (orbitKm || (i + 1) * (maxOrbit / (planets.length || 1))) / (maxOrbit || 1);
                const speed = 0.8 / (0.3 + normOrbit); // inner faster
                const angle = 2 * Math.PI * (t * speed + i * 0.07); // offset by index
                const x = center + r * Math.cos(angle);
                const y = center + r * Math.sin(angle);
                const color = palette[i % palette.length];
                return (
                    <g key={`planet-${p.id ?? i}`} aria-hidden={false}>
                        <circle cx={x} cy={y} r={6} fill={color} filter="url(#softGlow)" />
                        <text x={x + 12} y={y - 12} fontSize={10} fill="#e6eef8" style={{ textShadow: "0 1px 0 #00000066" }}>
                            {p.name ?? `#${p.id}`}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

/* -------------------------------- component -------------------------------- */

const PlanetList: React.FC = () => {
    const apiUrl = import.meta.env.VITE_PLANET_URL;
    const navigate = useNavigate();

    // --- core state ---
    const [planets, setPlanets] = useState<StrapiPlanet[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // UI state
    const [selected, setSelected] = useState<StrapiPlanet | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Persist currently selected tab index
    const [tab, setTab] = useState<number>(() => Number(localStorage.getItem("cosmo.tab") || 0));
    useEffect(() => localStorage.setItem("cosmo.tab", String(tab)), [tab]);

    const [epoch, setEpoch] = useState<Date | null>(new Date());
    const [sliderValue, setSliderValue] = useState(0);
    const [playing, setPlaying] = useState(false);
    const rafRef = useRef<number | null>(null);

    const [quickSelect, setQuickSelect] = useState<string | null>(null);
    const [searchValue, setSearchValue] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [dataState, setDataState] = useState<DataState>({ skip: 0, take: 8, sort: [] });

    // Tile layout persistence
    const [tilePositions, setTilePositions] = usePersistentState(
        "cosmoscope.tilePositions",
        [{ col: 1, colSpan: 1, rowSpan: 1 }, { col: 1, colSpan: 1, rowSpan: 1 }]
    );

    // --- Strapi v5 resilient normalization ---
    const unwrapAttributes = (maybe: any) => {
        if (maybe == null) return maybe;
        if (maybe?.data && Array.isArray(maybe.data)) return maybe.data;
        if (maybe?.data && maybe.data?.attributes) return { id: maybe.data.id, ...maybe.data.attributes };
        if (maybe?.attributes) {
            const out: any = {};
            for (const [k, v] of Object.entries(maybe.attributes)) {
                if (v && typeof v === "object" && "data" in v) {
                    if (Array.isArray((v as any).data)) {
                        out[k] = (v as any).data.map((d: any) => (d?.attributes ? { id: d.id, ...d.attributes } : d));
                    } else if ((v as any).data) {
                        const d: any = (v as any).data;
                        out[k] = d?.attributes ? { id: d.id, ...d.attributes } : d;
                    } else {
                        out[k] = (v as any).data;
                    }
                } else {
                    out[k] = v;
                }
            }
            return { id: maybe.id, ...out };
        }
        return maybe;
    };

    const normalizeRaw = useCallback((rawList: any[]): StrapiPlanet[] => {
        return rawList.map((r) => {
            const obj: any = unwrapAttributes(r);
            return {
                id: obj?.id ?? r?.id,
                name: obj?.name ?? obj?.title ?? r?.name,
                radius_km: safeNumber(obj?.radius_km ?? obj?.radius ?? null),
                orbit_radius_km: obj?.orbit_radius_km ?? obj?.orbit_radius ?? null,
                mass_kg: obj?.mass_kg ?? obj?.mass ?? null,
                gravity_m_s2: safeNumber(obj?.gravity_m_s2 ?? obj?.gravity),
                density_kg_m3: safeNumber(obj?.density_kg_m3 ?? obj?.density),
                description: obj?.description ?? obj?.summary ?? null,
            } as StrapiPlanet;
        });
    }, []);

    // --- fetch planets ---
    const fetchPlanets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(apiUrl, { withCredentials: false, params: { populate: "*" } });
            const rawList: any[] = Array.isArray(res.data?.data) ? res.data.data : [];
            const typed = normalizeRaw(rawList);
            setPlanets(typed);
        } catch (err: any) {
            setError(err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || "Failed to fetch planets");
        } finally {
            setLoading(false);
        }
    }, [apiUrl, normalizeRaw]);

    useEffect(() => {
        fetchPlanets();
    }, [fetchPlanets]);

    // --- debounce search ---
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchValue.trim()), 200);
        return () => clearTimeout(t);
    }, [searchValue]);

    // --- recharts data ---
    const rechartsData = useMemo(
        () =>
            planets.map((p) => ({
                name: p.name ?? `#${p.id}`,
                radius: p.radius_km ?? 0,
            })),
        [planets]
    );

    const names = useMemo(() => planets.map((p) => p.name ?? `#${p.id}`), [planets]);

    // --- filtered + processed grid data ---
    const filteredPlanets = useMemo(() => {
        const q = debouncedSearch.toLowerCase();
        if (!q) return planets;
        return planets.filter((p: StrapiPlanet) => (p.name ?? "").toLowerCase().includes(q));
    }, [planets, debouncedSearch]);

    const result: DataResult = useMemo(
        () => process(filteredPlanets, dataState),
        [filteredPlanets, dataState]
    );

    const onDataStateChange = useCallback((e: any) => setDataState(e.dataState), []);

    // --- row click opens dialog ---
    const onRowClick = useCallback((e: any) => {
        setSelected(e.dataItem as StrapiPlanet);
        setDialogOpen(true);
    }, []);

    // --- Tile reposition ---
    const handleTileReposition = useCallback(
        (e: TileLayoutRepositionEvent) => setTilePositions((e as any).value),
        [setTilePositions]
    );

    // --- playback loop for orbit animation ---
    useEffect(() => {
        let last = performance.now();
        const step = (now: number) => {
            const dt = now - last;
            last = now;
            setSliderValue((prev) => {
                const speedPerMs = 1 / 20000; // full cycle ~20s
                const next = prev + dt * speedPerMs * 1000; // slider 0..1000
                return next % 1000;
            });
            rafRef.current = requestAnimationFrame(step);
        };
        if (playing) {
            rafRef.current = requestAnimationFrame(step);
        } else if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        };
    }, [playing]);

    // --- stepper tiles ---

    // --- logout ---
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    /* --------------------------------- render -------------------------------- */
    return (
        <div className="p-4 min-h-screen relative">
            <div className="cosmo-stars" />
            <div className="p-4 min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black text-slate-100">
                <AppBar className="mb-4 bg-black/40 backdrop-blur-md border-b border-white/10 shadow-md sticky top-0 z-40">
                    <div className="flex items-center gap-3 w-full px-4 py-2">
                        <div className="font-bold tracking-widest text-sky-300">COSMOSCOPE</div>
                        <div className="ml-auto flex items-center gap-3">
                            <Avatar rounded="full" className="w-8 h-8 ring-2 ring-sky-400/40" aria-hidden />
                            <button
                                onClick={handleLogout}
                                className="px-3 py-1.5 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </AppBar>

                <div className="max-w-7xl mx-auto px-4">
                    <div className="my-3 px-3 py-2 rounded-lg bg-sky-500/10 border border-sky-400/20 text-sky-200 text-sm">
                        Welcome back, Explorer. The cosmos is humming. ✨
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 max-w-7xl mx-auto">
                    {/* ------------------------------ sidebar ----------------------------- */}
                    <aside className="space-y-4">
                        <Card className="p-6 bg-gradient-to-br from-slate-900/70 to-slate-800/70 
                backdrop-blur-md border border-slate-600/30 rounded-2xl 
                shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_30px_rgba(0,0,0,0.5)] 
                transition-shadow duration-300">

                            {/* Header */}
                            <div className="mb-5 text-center">
                                <h3 className="text-lg font-semibold tracking-wide text-sky-300 drop-shadow-sm">
                                    🚀 Controls
                                </h3>
                            </div>

                            {/* Date Picker */}
                            <div className="mb-4">
                                <label className="block text-xs uppercase text-slate-400 mb-1">
                                    Epoch Date
                                </label>
                                <DatePicker
                                    aria-label="Choose epoch date"
                                    value={epoch}
                                    onChange={(e: any) => setEpoch(e.value)}
                                    className="w-full bg-white/5 rounded-md"
                                />
                            </div>

                            {/* Quick Select Dropdown */}
                            <div className="mb-4">
                                <DropDownList
                                    aria-label="Quick select planet"
                                    data={names}
                                    value={quickSelect ?? ""}
                                    onChange={(e: any) => setQuickSelect(e.target.value)}
                                    className="w-full bg-white/5 rounded-md"
                                />
                            </div>

                            {/* Simulation Slider */}
                            <div className="mb-4">
                                <label className="block text-xs uppercase text-slate-400 mb-2">
                                    Orbit Simulation
                                </label>
                                <div className="flex items-center gap-3">
                                    <Slider
                                        aria-label="Simulation slider"
                                        min={0}
                                        max={1000}
                                        value={sliderValue}
                                        onChange={(e: any) => setSliderValue(e.value)}
                                        className="flex-1"
                                    />

                                    {/* Play / Pause Button */}
                                    <button
                                        aria-label={playing ? "Pause simulation" : "Play simulation"}
                                        onClick={() => setPlaying((p) => !p)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center
                    ${playing
                                                ? "bg-red-500/80 hover:bg-red-600"
                                                : "bg-sky-500/80 hover:bg-sky-600"} 
                    text-white transition-colors shadow-md`}
                                    >
                                        {playing ? "⏸" : "▶"}
                                    </button>

                                    {/* Slider Percentage */}
                                    <span className="text-sm text-slate-300 font-mono w-12 text-right">
                                        {Math.round((sliderValue / 1000) * 100)}%
                                    </span>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="mb-4">
                                <label className="block text-xs uppercase text-slate-400 mb-1">
                                    Search Planets
                                </label>
                                <AutoComplete
                                    aria-label="Search planets"
                                    data={names}
                                    value={searchValue}
                                    onChange={(e: any) => setSearchValue(e.target.value)}
                                    className="w-full bg-white/5 rounded-md"
                                    placeholder="Type a planet name..."
                                />
                            </div>

                            {/* Progress Bar */}
                            <div className="flex items-center gap-3 mb-6">
                                <ProgressBar
                                    value={Math.min(100, sliderValue / 10)}
                                    className="flex-1 h-2 rounded-full"
                                    aria-hidden
                                />
                            </div>
                        </Card>

                        <TileLayout
                            columns={1}
                            rowHeight={180}
                            positions={tilePositions}
                            gap={{ rows: 8, columns: 8 }}
                            onReposition={handleTileReposition as any}
                            className="bg-white/6 backdrop-blur-sm border border-white/6 rounded-lg"
                        />
                    </aside>

                    {/* -------------------------------- main ------------------------------ */}
                    <main>
                        <TabStrip
                            selected={tab}
                            onSelect={(e: any) => setTab(e.selected)}
                            tabPosition="top"
                            className="cosmo-tabstrip bg-white/5 border border-white/10 rounded-xl overflow-hidden gap-10"
                        >
                            <TabStripTab title="Orbits">
                                <div className="p-3">
                                    {/* orbit viz */}
                                    <div className="mb-4 bg-black/10 p-3 rounded">
                                        <OrbitViz planets={planets} t={sliderValue / 1000} />
                                    </div>

                                    {/* grid + chart */}
                                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3">
                                        <section className="bg-white/5 p-3 rounded-lg">
                                            <div className="h-[320px]">
                                                {loading ? (
                                                    <div className="p-6">
                                                        <Skeleton shape="rectangle" className="w-full h-64 mb-3" />
                                                        <Skeleton shape="rectangle" className="w-full h-6" />
                                                    </div>
                                                ) : error ? (
                                                    <div className="p-4 text-sm text-red-400">
                                                        <div>Error loading planets: {error}</div>
                                                        <div className="mt-2">
                                                            <button onClick={() => fetchPlanets()} className="px-3 py-1 rounded bg-sky-600 text-white">
                                                                Retry
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Grid
                                                        className="cosmo-grid rounded"
                                                        style={{ height: "100%" }}
                                                        data={result.data}
                                                        total={result.total}
                                                        skip={dataState.skip}
                                                        take={dataState.take}
                                                        sort={dataState.sort}
                                                        onDataStateChange={onDataStateChange}
                                                        sortable
                                                        onRowClick={onRowClick}
                                                        aria-label="Planets grid"
                                                    >
                                                        <GridNoRecords>
                                                            <div className="p-6 text-slate-300">No planets match your query.</div>
                                                        </GridNoRecords>

                                                        <GridColumn field="name" title="Name" width="160px" />
                                                        <GridColumn field="radius_km" title="Radius (km)" width="130px" />
                                                        <GridColumn field="orbit_radius_km" title="Orbit radius (km)" width="170px" />
                                                        <GridColumn field="gravity_m_s2" title="Gravity" width="110px" />
                                                        <GridColumn field="density_kg_m3" title="Density" width="110px" />
                                                    </Grid>
                                                )}
                                            </div>
                                        </section>

                                        <aside className="bg-white/5 p-3 rounded-lg space-y-3">
                                            <div className="h-[260px] lg:h-[280px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={rechartsData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                                        <YAxis />
                                                        <ReTooltip formatter={(value: any) => `${value?.toLocaleString?.() ?? value} km`} />
                                                        <Bar dataKey="radius" name="Radius (km)" fill="#3b82f6" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </aside>
                                    </div>
                                </div>
                            </TabStripTab>

                            <TabStripTab title="Quiz">
                                <div className="p-3">
                                    <QuizPanel />
                                </div>
                            </TabStripTab>


                            <TabStripTab title="Details">
                                <div className="p-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                        {planets.map((p) => (
                                            <Card key={p.id} className="bg-white/6 p-3 rounded shadow-sm hover:shadow-md transition-shadow">
                                                <div className="font-bold text-gray-100">{p.name}</div>
                                                <div className="mt-1.5 text-gray-300 text-sm">{p.description ?? "No description."}</div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </TabStripTab>

                            <TabStripTab title="NASA">
                                <div className="p-3">
                                    <ApodPanel />
                                </div>
                            </TabStripTab>
                        </TabStrip>
                    </main>
                </div>

                {/* ------------------------------- dialog ------------------------------ */}
                {dialogOpen && selected && (
                    <Dialog
                        title={selected.name ?? "Planet"}
                        onClose={() => setDialogOpen(false)}
                        width={600}
                        className="rounded-lg gap-0.5"
                        aria-modal
                        aria-label={`${selected.name ?? "Planet"} details`}
                    >
                        <div className="p-3 space-y-2">
                            <div>
                                <strong className="text-gray-800">Radius:</strong>{" "}
                                {selected.radius_km ? selected.radius_km.toLocaleString() : "—"} km
                            </div>
                            <div>
                                <strong className="text-gray-800">Orbit radius:</strong>{" "}
                                {safeNumber(selected.orbit_radius_km)
                                    ? safeNumber(selected.orbit_radius_km)?.toLocaleString()
                                    : selected.orbit_radius_km ?? "—"}{" "}
                                km
                            </div>
                            <div>
                                <strong className="text-gray-800">Mass:</strong> {formatMass(selected.mass_kg)}
                            </div>
                            <div>
                                <strong className="text-gray-800">Gravity:</strong> {selected.gravity_m_s2 ?? "—"} m/s²
                            </div>
                            <div className="mt-2 text-gray-600">{selected.description ?? "No description."}</div>
                        </div>
                        <div className="justify-end gap-2 pt-3">
                            <DialogActionsBar>
                                <button
                                    className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors"
                                    onClick={() => setDialogOpen(false)}
                                    aria-label="Close planet dialog"
                                >
                                    Close
                                </button>
                                <a
                                    className="px-3 py-1.5 rounded-md bg-gray-200 text-black ml-2 text-sm hover:bg-gray-300 transition-colors"
                                    href={`${apiUrl.replace(/\/api\/.*$/, "")}/api/planets/${selected.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    View raw
                                </a>
                            </DialogActionsBar>
                        </div>
                    </Dialog>
                )}

                {/* ---------------------------- notifications --------------------------- */}
            </div>
        </div>
    );
};

export default PlanetList;
