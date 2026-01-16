// src/pages/dashboard-settings/index.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DashboardSettings = () => {
    const navigate = useNavigate();

    /* ================= SELECTED SECTION ================= */
    const [activeSection, setActiveSection] = useState("branding");

    /* ================= TEMP SETTINGS (PREVIEW STATE) ================= */
    const [previewTheme, setPreviewTheme] = useState("light");
    const [previewUnits, setPreviewUnits] = useState("normal");
    const [previewDensity, setPreviewDensity] = useState("normal");
    const [previewFont, setPreviewFont] = useState("default");
    const [previewRole, setPreviewRole] = useState("learner");

    /* ================= APPLY SETTINGS ================= */
    const applySettings = () => {
        localStorage.setItem("dashboardTheme", previewTheme);
        localStorage.setItem("dashboardUnits", previewUnits);
        localStorage.setItem("dashboardDensity", previewDensity);
        localStorage.setItem("dashboardFont", previewFont);
        localStorage.setItem("dashboardRole", previewRole);

        navigate(
            `/compliance-dashboard?theme=${previewTheme}&units=${previewUnits}&density=${previewDensity}&font=${previewFont}`
        );
    };

    /* ================= UI ================= */
    return (
        <div className="min-h-screen bg-background px-6 py-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard Settings</h1>
            <p className="text-muted-foreground mb-8">
                Customize dashboard appearance, data display, layout, and user experience.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: SETTINGS CATEGORIES */}
                <div className="space-y-3">
                    {[
                        ["branding", "Customization & Branding"],
                        ["data", "Data Presentation"],
                        ["realtime", "Real-time Features"],
                        ["layout", "Layout & Interactivity"],
                        ["ux", "User Experience"]
                    ].map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setActiveSection(key)}
                            className={`w-full text-left px-4 py-3 rounded border ${activeSection === key
                                    ? "bg-primary text-white"
                                    : "bg-card"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* MIDDLE: SUB-SETTINGS */}
                <div className="bg-card border rounded-lg p-6 space-y-4">
                    {activeSection === "branding" && (
                        <>
                            <h3 className="font-semibold text-lg">Customization & Branding</h3>

                            <label className="block">
                                Theme
                                <select
                                    className="border p-2 w-full mt-1"
                                    value={previewTheme}
                                    onChange={(e) => setPreviewTheme(e.target.value)}
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                </select>
                            </label>

                            <label className="block">
                                Font Style
                                <select
                                    className="border p-2 w-full mt-1"
                                    value={previewFont}
                                    onChange={(e) => setPreviewFont(e.target.value)}
                                >
                                    <option value="default">Default</option>
                                    <option value="serif">Serif</option>
                                    <option value="mono">Monospace</option>
                                </select>
                            </label>
                        </>
                    )}

                    {activeSection === "data" && (
                        <>
                            <h3 className="font-semibold text-lg">Data Presentation</h3>

                            <label className="block">
                                Unit Prefix
                                <select
                                    className="border p-2 w-full mt-1"
                                    value={previewUnits}
                                    onChange={(e) => setPreviewUnits(e.target.value)}
                                >
                                    <option value="normal">Normal</option>
                                    <option value="k">Thousands (k)</option>
                                    <option value="m">Millions (M)</option>
                                </select>
                            </label>
                        </>
                    )}

                    {activeSection === "realtime" && (
                        <>
                            <h3 className="font-semibold text-lg">Real-time Features</h3>

                            <label className="block">
                                Follow Radius
                                <input type="range" min="10" max="100" className="w-full mt-2" />
                            </label>

                            <label className="block">
                                Highlight Color
                                <select className="border p-2 w-full mt-1">
                                    <option>Red</option>
                                    <option>Orange</option>
                                    <option>Yellow</option>
                                </select>
                            </label>
                        </>
                    )}

                    {activeSection === "layout" && (
                        <>
                            <h3 className="font-semibold text-lg">Layout & Interactivity</h3>

                            <label className="block">
                                Layout Density
                                <select
                                    className="border p-2 w-full mt-1"
                                    value={previewDensity}
                                    onChange={(e) => setPreviewDensity(e.target.value)}
                                >
                                    <option value="normal">Normal</option>
                                    <option value="compact">Compact</option>
                                </select>
                            </label>

                            <p className="text-sm text-muted-foreground">
                                Dashboard layout adapts dynamically based on settings.
                            </p>
                        </>
                    )}

                    {activeSection === "ux" && (
                        <>
                            <h3 className="font-semibold text-lg">User Experience</h3>

                            <label className="block">
                                User Role
                                <select
                                    className="border p-2 w-full mt-1"
                                    value={previewRole}
                                    onChange={(e) => setPreviewRole(e.target.value)}
                                >
                                    <option value="learner">Learner</option>
                                    <option value="manager">Manager</option>
                                </select>
                            </label>
                        </>
                    )}
                </div>

                {/* RIGHT: LIVE PREVIEW */}
                <div
                    className={`border rounded-lg p-6 ${previewDensity === "compact" ? "text-sm" : ""
                        }`}
                    style={{
                        fontFamily:
                            previewFont === "serif"
                                ? "serif"
                                : previewFont === "mono"
                                    ? "monospace"
                                    : "inherit"
                    }}
                >
                    <h4 className="font-semibold mb-2">Preview</h4>
                    <p className="text-muted-foreground">
                        Theme: {previewTheme}
                    </p>
                    <p className="text-muted-foreground">
                        Units: {previewUnits}
                    </p>
                    <p className="text-muted-foreground">
                        Density: {previewDensity}
                    </p>
                    <p className="text-muted-foreground">
                        Role: {previewRole}
                    </p>
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-8 flex gap-4">
                <button
                    onClick={applySettings}
                    className="bg-primary text-white px-6 py-3 rounded"
                >
                    Apply Changes
                </button>

                <button
                    onClick={() => navigate("/compliance-dashboard")}
                    className="px-6 py-3 border rounded"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default DashboardSettings;
