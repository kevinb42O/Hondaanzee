
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { CITIES } from '../cityData.ts';
import { COASTAL_PATHS } from '../pages/CoastalPathsData.ts';

interface CoastalMapRendererProps {
    mapRef: React.RefObject<HTMLDivElement | null>;
    userCity: string | null;
    onHoverCity: (city: string | null) => void;
}

export const CoastalMapRenderer: React.FC<CoastalMapRendererProps> = ({ mapRef, userCity, onHoverCity }) => {
    const leafletInstance = useRef<L.Map | null>(null);
    const navigate = useNavigate();

    // Initial SVG dimensions (from the original SVG viewBox)
    const svgWidth = 625;
    const svgHeight = 372;
    const mapBounds: L.LatLngBoundsExpression = [[0, 0], [svgHeight, svgWidth]];

    useEffect(() => {
        if (!mapRef.current) return;

        if (leafletInstance.current) {
            leafletInstance.current.remove();
            leafletInstance.current = null;
        }

        // Initialize map
        const map = L.map(mapRef.current, {
            crs: L.CRS.Simple,
            minZoom: -1,
            maxZoom: 2,
            zoomSnap: 0,
            zoomDelta: 0.1,
            boxZoom: true,
            zoomControl: false,
            dragging: true,
            scrollWheelZoom: true,
            doubleClickZoom: false,
            attributionControl: false,
            maxBounds: [[-50, -50], [svgHeight + 50, svgWidth + 50]],
            maxBoundsViscosity: 0.9,
        });

        const updateMinZoom = () => {
            const zoom = map.getBoundsZoom(mapBounds);
            map.setMinZoom(zoom);
        };

        leafletInstance.current = map;
        map.fitBounds(mapBounds);
        updateMinZoom();

        map.on('resize', () => {
            map.invalidateSize();
            updateMinZoom();
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Construct SVG Element manually using extracted paths
        const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElement.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        svgElement.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
        svgElement.setAttribute('xmlns', "http://www.w3.org/2000/svg");

        svgElement.style.width = '100%';
        svgElement.style.height = '100%';
        svgElement.style.overflow = 'visible';
        svgElement.classList.add('map-3d-shadow');

        // --- 1. Define Professional Gradients & Filters ---
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        defs.innerHTML = `
            <filter id="land-shadow" x="-50%" y="-50%" width="200%" height="200%">
                 <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.4"/>
            </filter>
            <linearGradient id="grad-vrij" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#34d399;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="grad-deels" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#fb923c;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#ea580c;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="grad-verboden" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#f43f5e;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#be123c;stop-opacity:1" />
            </linearGradient>
             <linearGradient id="grad-default" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#fcd34d;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#d97706;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="grad-hover" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#b45309;stop-opacity:1" />
            </linearGradient>
        `;
        svgElement.appendChild(defs);

        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.visibility = 'hidden';
        tempContainer.style.width = '0px';
        tempContainer.style.height = '0px';
        document.body.appendChild(tempContainer);

        const measureSvg = svgElement.cloneNode(false) as SVGElement;
        tempContainer.appendChild(measureSvg);

        const labelGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        labelGroup.setAttribute('class', 'map-labels');

        CITIES.forEach(city => {
            const pathKey = Object.keys(COASTAL_PATHS).find(key => city.name.includes(key));
            const pathData = pathKey ? COASTAL_PATHS[pathKey] : null;

            if (pathData) {
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute('d', pathData);
                path.setAttribute('id', `sector-${city.slug}`);
                path.classList.add('kust-gemeente');

                // --- Dynamic Status Coloring ---
                const today = new Date();
                const currentMonth = today.getMonth() + 1;
                const currentDay = today.getDate();
                const dateString = `${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;

                let currentStatus = city.rules.winter.status;

                if (city.rules.summer) {
                    const start = city.rules.summer.start;
                    const end = city.rules.summer.end;

                    if (start && end) {
                        if (dateString >= start && dateString <= end) {
                            currentStatus = city.rules.summer.status;
                        }
                    }
                }

                let fillUrl = 'url(#grad-default)';

                if (currentStatus === 'JA' || (currentStatus as string) === 'VRIJ') {
                    fillUrl = 'url(#grad-vrij)';
                } else if (currentStatus === 'DEELS') {
                    fillUrl = 'url(#grad-deels)';
                } else if (currentStatus === 'NEE' || (currentStatus as string) === 'VERBODEN') {
                    fillUrl = 'url(#grad-verboden)';
                }

                path.style.fill = fillUrl;
                path.style.fillOpacity = '0.95';
                path.setAttribute('filter', 'url(#land-shadow)');

                path.style.stroke = 'rgba(255, 255, 255, 0.4)';
                path.style.strokeWidth = '1px';
                path.style.transition = 'all 0.3s ease';

                path.addEventListener('mouseenter', () => {
                    path.style.fill = 'url(#grad-hover)';
                    onHoverCity(city.name);

                    const label = svgElement.querySelector(`#label-${city.slug}`) as SVGTextElement;
                    if (label) {
                        label.setAttribute('fill', '#FFC107');
                        label.setAttribute('font-weight', '800');
                        label.setAttribute('font-size', '12px');
                        label.style.textShadow = '0px 0px 8px rgba(0,0,0,0.5)';
                    }
                });

                path.addEventListener('mouseleave', () => {
                    path.style.fill = fillUrl;
                    onHoverCity(null);

                    const label = svgElement.querySelector(`#label-${city.slug}`) as SVGTextElement;
                    if (label) {
                        label.setAttribute('fill', 'white');
                        label.setAttribute('font-weight', '600');
                        label.setAttribute('font-size', '8px');
                        label.style.textShadow = 'none';
                    }
                });

                path.addEventListener('click', () => {
                    navigate(`/${city.slug}`);
                });

                svgElement.appendChild(path);

                // --- Label Logic ---
                const measurePath = path.cloneNode(true) as SVGPathElement;
                measureSvg.appendChild(measurePath);
                const bbox = measurePath.getBBox();

                let centerX = bbox.x + bbox.width / 2;
                let centerY = bbox.y + bbox.height / 2;

                // Use OVERRIDE if present, otherwise default to calculated bbox center
                if (city.labelOverride) {
                    centerX = city.labelOverride.x;
                    centerY = city.labelOverride.y;
                }

                const fixedOffset = 60;

                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute('id', `label-${city.slug}`);

                const rotation = 50;

                text.setAttribute('x', centerX.toString());
                text.setAttribute('y', centerY.toString());
                text.setAttribute('transform', `rotate(${rotation}, ${centerX}, ${centerY}) translate(-${fixedOffset}, 0)`);

                text.setAttribute('text-anchor', 'end');
                text.setAttribute('fill', 'white');
                text.setAttribute('font-size', '8px');
                text.setAttribute('font-weight', '600');
                text.setAttribute('font-family', "'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif");
                text.style.pointerEvents = 'none';
                text.style.letterSpacing = '0.3px';
                text.style.transition = 'all 0.3s ease';

                text.textContent = city.name.replace(' - ', '-');

                labelGroup.appendChild(text);
            }
        });

        svgElement.appendChild(labelGroup);

        // --- Render User Location Pin --- 
        if (userCity) {
            const userCityData = CITIES.find(c => c.slug === userCity);
            if (userCityData) {
                const pathKey = Object.keys(COASTAL_PATHS).find(key => userCityData.name.includes(key));
                const pathData = pathKey ? COASTAL_PATHS[pathKey] : null;

                if (pathData) {
                    const measurePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    measurePath.setAttribute('d', pathData);
                    measureSvg.appendChild(measurePath);
                    const bbox = measurePath.getBBox();

                    let pinX = bbox.x + bbox.width / 2;
                    let pinY = bbox.y + bbox.height / 2;

                    // Use overrides for pin too if available
                    if (userCityData.labelOverride) {
                        pinX = userCityData.labelOverride.x;
                        pinY = userCityData.labelOverride.y;
                    }

                    const pinGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    pinGroup.setAttribute('transform', `translate(${pinX}, ${pinY})`);
                    pinGroup.style.pointerEvents = 'none';

                    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    dot.setAttribute('r', '4');
                    dot.setAttribute('fill', '#DC2626');
                    dot.setAttribute('stroke', 'white');
                    dot.setAttribute('stroke-width', '2');

                    const pulse = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    pulse.setAttribute('r', '8');
                    pulse.setAttribute('fill', 'rgba(220, 38, 38, 0.4)');

                    const anim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                    anim.setAttribute('attributeName', 'r');
                    anim.setAttribute('from', '4');
                    anim.setAttribute('to', '12');
                    anim.setAttribute('dur', '1.5s');
                    anim.setAttribute('repeatCount', 'indefinite');
                    pulse.appendChild(anim);

                    const animOp = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                    animOp.setAttribute('attributeName', 'opacity');
                    animOp.setAttribute('from', '0.8');
                    animOp.setAttribute('to', '0');
                    animOp.setAttribute('dur', '1.5s');
                    animOp.setAttribute('repeatCount', 'indefinite');
                    pulse.appendChild(animOp);

                    pinGroup.appendChild(pulse);
                    pinGroup.appendChild(dot);

                    svgElement.appendChild(pinGroup);
                }
            }
        }

        document.body.removeChild(tempContainer);
        L.svgOverlay(svgElement, mapBounds, { interactive: true }).addTo(map);

        return () => {
            if (leafletInstance.current) {
                leafletInstance.current.remove();
                leafletInstance.current = null;
            }
        };
    }, [navigate, userCity, onHoverCity, mapRef]); // Removed unnecessary deps, added onHoverCity

    return null;
};
