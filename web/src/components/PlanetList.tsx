import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
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
    ExpansionPanel,
    Card,
    Avatar,
} from "@progress/kendo-react-layout";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { DropDownList, AutoComplete } from "@progress/kendo-react-dropdowns";
import { Slider, MaskedTextBox } from "@progress/kendo-react-inputs";
import { ProgressBar } from "@progress/kendo-react-progressbars";
import { Skeleton } from "@progress/kendo-react-indicators";
import { Notification, NotificationGroup } from "@progress/kendo-react-notification";
import { CustomStepper } from "./CustomStepper";
import ApodPanel from "./ApodPanel";
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

const safeNumber = (v: any): number | null => {
    if (v === null || v === undefined || v === "") return null;
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    const n = Number(String(v));
    if (!Number.isFinite(n)) return null;
    return n;
};

const formatMass = (mass: any) => {
    if (mass == null) return "—";
    if (typeof mass === "string") {
        const parsed = Number(mass);
        if (Number.isFinite(parsed)) {
            return `${parsed.toExponential(3)} kg`;
        }
        return `${mass} kg`;
    }
    if (typeof mass === "number") return `${mass.toExponential(3)} kg`;
    return String(mass);
};

/** local storage hook */
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
            // ignore
        }
    }, [key, state]);
    return [state, setState] as const;
};

/** Orbit visualization component
 * Props:
 *  - planets: array with orbit_radius_km and name
 *  - t: number (0..1) normalized time parameter (we'll pass sliderValue/1000)
 */
const OrbitViz: React.FC<{ planets: StrapiPlanet[]; t: number; size?: number }> = ({ planets, t, size = 360 }) => {
    const center = size / 2;
    const padding = 28; // padding around edges
    // gather numeric orbit radii (or fallback)
    const orbitNums = planets.map((p) => Math.max(0, safeNumber(p.orbit_radius_km) ?? 0));
    const maxOrbit = Math.max(...orbitNums, 1);

    // colors for markers (repeat if needed)
    const palette = ["#f97316", "#06b6d4", "#60a5fa", "#f472b6", "#a78bfa", "#34d399"];

    // svg radius available for drawing (from center to outermost orbit)
    const maxDrawableR = center - padding;

    // map each orbit value (km) to px radius
    const mapOrbitToPx = (orbitKm: number) => {
        if (!orbitKm || maxOrbit === 0) return Math.max(20, maxDrawableR * 0.2);
        // use sqrt scaling to compress large ranges (optional tweak)
        const norm = Math.sqrt(orbitKm) / Math.sqrt(maxOrbit);
        return 20 + norm * (maxDrawableR - 20);
    };

    return (
        <div className="w-full flex justify-center items-center">
            <svg width={size} height={size} role="img" aria-label="Orbit visualization" className="block">
                {/* background subtle */}
                <defs>
                    <radialGradient id="sunGrad" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="#fff7cc" stopOpacity="1" />
                        <stop offset="60%" stopColor="#ffd66b" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#ff7a18" stopOpacity="0.15" />
                    </radialGradient>
                </defs>

                {/* optional faint stars grid */}
                <rect x="0" y="0" width={size} height={size} fill="transparent" />

                {/* Sun in center */}
                <circle cx={center} cy={center} r={12} fill="url(#sunGrad)" stroke="#ffd66b" strokeOpacity={0.6} />

                {/* orbits */}
                {planets.map((p, i) => {
                    const orbitKm = Math.max(0, safeNumber(p.orbit_radius_km) ?? 0);
                    const r = mapOrbitToPx(orbitKm || (i + 1) * (maxOrbit / (planets.length || 1)));
                    return (
                        <g key={`orbit-${p.id ?? i}`}>
                            <circle cx={center} cy={center} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 6" />
                        </g>
                    );
                })}

                {/* planet markers */}
                {planets.map((p, i) => {
                    const orbitKm = Math.max(0, safeNumber(p.orbit_radius_km) ?? 0);
                    const r = mapOrbitToPx(orbitKm || (i + 1) * (maxOrbit / (planets.length || 1)));
                    // give each planet a speed factor so inner planets go faster visually
                    const normOrbit = (orbitKm || (i + 1) * (maxOrbit / (planets.length || 1))) / (maxOrbit || 1);
                    const speed = 0.8 / (0.3 + normOrbit); // tweak constants for pleasing motion
                    const angle = 2 * Math.PI * (t * speed + (i * 0.07)); // offset by index to avoid overlap
                    const x = center + r * Math.cos(angle);
                    const y = center + r * Math.sin(angle);
                    const color = palette[i % palette.length];
                    const labelOffset = 12;
                    return (
                        <g key={`planet-${p.id ?? i}`} aria-hidden={false}>
                            <circle cx={x} cy={y} r={6} fill={color} stroke="#00000022" />
                            <text x={x + labelOffset} y={y - labelOffset} fontSize={10} fill="#e6eef8" style={{ textShadow: "0 1px 0 #00000066" }}>
                                {p.name ?? `#${p.id}`}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

const PlanetList: React.FC = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:1337/api/planets";
    const [planets, setPlanets] = useState<StrapiPlanet[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<StrapiPlanet | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [tab, setTab] = useState(0);
    const [epoch, setEpoch] = useState<Date | null>(new Date());
    const [sliderValue, setSliderValue] = useState(0);
    const [quickSelect, setQuickSelect] = useState<string | null>(null);
    const [searchValue, setSearchValue] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [notifVisible, setNotifVisible] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [loadingSkeleton, setLoadingSkeleton] = useState(false);

    // Local persist
    const [tilePositions, setTilePositions] = usePersistentState(
        "cosmoscope.tilePositions",
        [{ col: 1, colSpan: 1, rowSpan: 1 }, { col: 1, colSpan: 1, rowSpan: 1 }]
    );

    // playback state for orbit simulation
    const [playing, setPlaying] = useState(false);
    const rafRef = useRef<number | null>(null);

    // normalize/resilient fetch for Strapi v5 or similar
    const unwrapAttributes = (maybe: any) => {
        if (maybe == null) return maybe;
        if (maybe?.data && Array.isArray(maybe.data)) return maybe.data;
        if (maybe?.data && maybe.data?.attributes) return { id: maybe.data.id, ...maybe.data.attributes };
        if (maybe?.attributes) {
            const out: any = {};
            for (const [k, v] of Object.entries(maybe.attributes)) {
                if (v && typeof v === "object" && "data" in v) {
                    if (Array.isArray(v.data)) {
                        out[k] = v.data.map((d: any) => (d?.attributes ? { id: d.id, ...d.attributes } : d));
                    } else if (v.data && v.data) {
                        out[k] = { id: v.data, ...v.data };
                    } else {
                        out[k] = v.data;
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
            const obj = unwrapAttributes(r);
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

    const fetchPlanets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(apiUrl, { withCredentials: false, params: { populate: "*" } });
            const payload = res.data;
            const rawList: any[] = Array.isArray(payload?.data) ? payload.data : [];
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

    // Debounce search locally
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchValue.trim()), 200);
        return () => clearTimeout(t);
    }, [searchValue]);

    // memoized chart data
    const rechartsData = useMemo(
        () =>
            planets.map((p) => ({
                name: p.name ?? `#${p.id}`,
                radius: p.radius_km ?? 0,
            })),
        [planets]
    );

    const names = useMemo(() => planets.map((p) => p.name ?? `#${p.id}`), [planets]);

    // keyboard accessible row renderer
    const rowRender = (trElement: any, props: any) => {
        const handleKeyDown = (ev: React.KeyboardEvent) => {
            if (ev.key === "Enter" || ev.key === " ") {
                ev.preventDefault();
                setSelected(props.dataItem as StrapiPlanet);
                setDialogOpen(true);
            }
        };
        const newProps = {
            ...trElement.props,
            role: "row",
            tabIndex: 0,
            onKeyDown: handleKeyDown,
            "aria-label": `Row for ${props?.dataItem?.name ?? `#${props?.dataItem?.id}`}`,
        };
        return React.cloneElement(trElement, newProps, trElement.props.children);
    };

    const onRowClick = useCallback((e: any) => {
        setSelected(e.dataItem as StrapiPlanet);
        setDialogOpen(true);
    }, []);

    const handleTileReposition = useCallback((e: TileLayoutRepositionEvent) => {
        const val = (e as any).value;
        setTilePositions(val);
    }, [setTilePositions]);

    // Playback frame loop (advances sliderValue smoothly while playing)
    useEffect(() => {
        let last = performance.now();
        const step = (now: number) => {
            const dt = now - last;
            last = now;
            // advance slider by dt * speed (speed tuned so full loop ~20s)
            setSliderValue((prev) => {
                const speedPerMs = 1 / 20000; // full cycle ~20s
                const next = prev + dt * speedPerMs * 1000; // because slider range 0..1000
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

    const steps = [{ label: "Plan" }, { label: "Launch" }, { label: "Orbit" }];

    const tiles = [
        {
            header: "Mission",
            body: (
                <Card className="p-0">
                    <div className="font-semibold p-4 pb-2">Mission</div>
                    <div className="p-4 pt-0">
                        <CustomStepper value={stepIndex} onChange={(i) => setStepIndex(i)} steps={steps} />
                    </div>
                </Card>
            ),
        },
        {
            header: "Info",
            body: (
                <ExpansionPanel title="Info" className="p-0">
                    <div className="p-4">Physics notes and sources</div>
                </ExpansionPanel>
            ),
        },
    ];

    return (
        <div className="p-4 min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black text-slate-100">
            <AppBar className="mb-4 shadow-sm bg-white/5" >
                <div className="flex items-center gap-3 w-full px-3">
                    <div className="font-bold text-lg">Cosmoscope</div>

                    <nav aria-label="breadcrumb" className="ml-3">
                        <ol className="flex gap-2 list-none m-0 p-0">
                            <li>
                                <a href="/" className="text-inherit underline hover:no-underline">
                                    Home
                                </a>
                            </li>
                            <li className="text-gray-400" aria-hidden>
                                /
                            </li>
                            <li className="text-gray-200">Explorer</li>
                        </ol>
                    </nav>

                    <div className="ml-auto flex gap-2 items-center relative">
                        <Avatar rounded="full" className="w-8 h-8" aria-hidden />
                        <div
                            className="absolute right-0 top-1.5 bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow-sm pointer-events-none leading-3"
                            aria-hidden
                        >
                            Live
                        </div>
                    </div>
                </div>
            </AppBar>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 max-w-7xl mx-auto">
                <aside className="space-y-4">
                    <Card className="p-4 bg-white/6 backdrop-blur-sm border border-white/6 rounded-lg">
                        <div className="mb-3 font-semibold text-gray-100">Controls</div>

                        <div className="mb-3">
                            <DatePicker aria-label="Choose epoch date" value={epoch} onChange={(e: any) => setEpoch(e.value)} />
                        </div>

                        <div className="mb-3">
                            <DropDownList
                                aria-label="Quick select planet"
                                data={names}
                                value={quickSelect ?? ""}
                                onChange={(e: any) => setQuickSelect(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <Slider
                                        aria-label="Simulation slider"
                                        min={0}
                                        max={1000}
                                        value={sliderValue}
                                        onChange={(e: any) => setSliderValue(e.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                    <button
                                        aria-label={playing ? "Pause simulation" : "Play simulation"}
                                        onClick={() => setPlaying((p) => !p)}
                                        className="px-2 py-1 rounded-md bg-sky-600 text-white text-sm"
                                    >
                                        {playing ? "⏸" : "▶"}
                                    </button>
                                    <div className="text-sm text-gray-200 w-12 text-right">{Math.round((sliderValue / 1000) * 100)}%</div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <MaskedTextBox aria-label="Coordinate input" mask="0000-0000" placeholder="Coord" />
                        </div>

                        <div className="mb-3">
                            <AutoComplete aria-label="Search planets" data={names} value={searchValue} onChange={(e: any) => setSearchValue(e.target.value)} />
                        </div>

                        <div className="flex gap-2 items-center mt-2">
                            <div className="flex-1">
                                <ProgressBar value={Math.min(100, sliderValue / 10)} aria-hidden />
                            </div>
                            <div className="w-3" />
                            <div className="bg-emerald-500 text-black text-xs px-1.5 py-0.5 rounded-full shadow-sm" aria-hidden>
                                {planets.length}
                            </div>
                        </div>

                        <div className="mt-3">
                            <button
                                aria-label="Show notification"
                                onClick={() => setNotifVisible(true)}
                                className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors"
                            >
                                Notify
                            </button>
                        </div>
                    </Card>

                    <div>
                        <TileLayout
                            columns={1}
                            rowHeight={180}
                            positions={tilePositions}
                            gap={{ rows: 8, columns: 8 }}
                            items={tiles}
                            onReposition={handleTileReposition as any}
                            className="bg-white/6 backdrop-blur-sm border border-white/6 rounded-lg"
                        />
                    </div>

                    <Card className="bg-white/6 backdrop-blur-sm border border-white/6 rounded-lg p-4">
                        <div className="font-semibold mb-2 text-gray-100">Quick Actions</div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                aria-label="Refresh planets"
                                onClick={() => fetchPlanets()}
                                className="px-3 py-1.5 rounded-md bg-sky-600 text-white text-sm hover:bg-sky-700 transition-colors flex-1 sm:flex-none"
                            >
                                Refresh
                            </button>
                            <button
                                aria-label="Simulate loading"
                                onClick={() => {
                                    setLoadingSkeleton(true);
                                    setTimeout(() => setLoadingSkeleton(false), 800);
                                }}
                                className="px-3 py-1.5 rounded-md bg-gray-300 text-gray-900 text-sm hover:bg-gray-400 transition-colors flex-1 sm:flex-none"
                            >
                                Simulate Load
                            </button>
                        </div>
                        <div className="mt-2">{loadingSkeleton ? <Skeleton shape="rectangle" className="w-full h-4" /> : null}</div>
                    </Card>
                </aside>

                <main>
                    <TabStrip selected={tab} onSelect={(e: any) => setTab(e.selected)} className="bg-white/6 border border-white/6 rounded-lg overflow-hidden">
                        <TabStripTab title="Orbits">
                            <div className="p-3">
                                {/* Orbit visualization */}
                                <div className="mb-4 bg-black/10 p-3 rounded">
                                    <OrbitViz planets={planets} t={sliderValue / 1000} size={420} />
                                </div>

                                {/* Grid + chart below */}
                                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3">
                                    <section className="bg-white/5 p-3 rounded-lg">
                                        <div className="h-[260px] lg:h-[320px]">
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
                                                    data={planets.filter((p) => (debouncedSearch ? (p.name ?? "").toLowerCase().includes(debouncedSearch.toLowerCase()) : true))}
                                                    onRowClick={onRowClick}
                                                    style={{ height: "100%" }}
                                                    className="rounded"
                                                    aria-label="Planets table"
                                                >
                                                    <GridColumn field="name" title="Name" width="140px" />
                                                    <GridColumn field="radius_km" title="Radius (km)" width="120px" />
                                                    <GridColumn field="orbit_radius_km" title="Orbit radius (km)" width="160px" />
                                                    <GridColumn field="gravity_m_s2" title="Gravity" width="110px" />
                                                    <GridColumn field="density_kg_m3" title="Density" width="110px" />
                                                </Grid>
                                            )}
                                        </div>
                                    </section>

                                    <aside className="bg-white/5 p-3 rounded-lg space-y-3">
                                        <div className="h-[240px] lg:h-[280px]">
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

                                        <Card className="bg-white/6 p-3 rounded">
                                            <div className="font-semibold text-gray-100">Selected</div>
                                            <div className="mt-2 text-gray-300">{selected?.name ?? "—"}</div>
                                            <div className="mt-2">Mass: {formatMass(selected?.mass_kg)}</div>
                                        </Card>
                                    </aside>
                                </div>
                            </div>
                        </TabStripTab>

                        <TabStripTab title="Details">
                            <div className="p-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {planets.map((p) => (
                                        <Card key={p.id} className="bg-white/6 p-3 rounded shadow-sm hover:shadow-md transition-shadow">
                                            <div className="font-bold text-gray-100">{p.name}</div>
                                            <div className="mt-1.5 text-gray-300 text-sm">{p.description}</div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </TabStripTab>

                        <TabStripTab title="NASA Photo">
                            <div className="p-3">
                                <ApodPanel />
                            </div>
                        </TabStripTab>


                        <TabStripTab title="ISRO">
                            <div className="p-3">
                                <div className="text-gray-300">ISRO launches placeholder</div>
                            </div>
                        </TabStripTab>
                    </TabStrip>
                </main>
            </div>

            {dialogOpen && selected && (
                <Dialog
                    title={selected.name ?? "Planet"}
                    onClose={() => setDialogOpen(false)}
                    width={600}
                    className="rounded-lg"
                    aria-modal
                    aria-label={`${selected.name ?? "Planet"} details`}
                >
                    <div className="p-3 space-y-2">
                        <div>
                            <strong className="text-gray-800">Radius:</strong> {selected.radius_km ? selected.radius_km.toLocaleString() : "—"} km
                        </div>
                        <div>
                            <strong className="text-gray-800">Orbit radius:</strong>{" "}
                            {safeNumber(selected.orbit_radius_km) ? safeNumber(selected.orbit_radius_km)?.toLocaleString() : selected.orbit_radius_km ?? "—"} km
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

            <NotificationGroup className="fixed top-5 right-5 z-50" aria-live="polite">
                {notifVisible && (
                    <Notification type={{ style: "info", icon: true }} closable onClose={() => setNotifVisible(false)} aria-live="assertive">
                        <span>New APOD available</span>
                    </Notification>
                )}
            </NotificationGroup>
        </div>
    );
};

export default PlanetList;
