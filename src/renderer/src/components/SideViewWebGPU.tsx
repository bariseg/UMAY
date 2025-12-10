import React, { useRef, useEffect, useState } from 'react';
import { TelemetryData } from '../interfaces/interfaces';
import shaderCode from './shaders/SideView.wgsl?raw';

interface SideViewChartProps {
    id: string;
    telemetry: TelemetryData | null;
    yRange?: [number, number];
    title?: string;
}

const WebGPUSideView: React.FC<SideViewChartProps> = (props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const deviceRef = useRef<GPUDevice | null>(null);

    // Pipeline referanslarını tutuyoruz
    const pipelinesRef = useRef<{
        line: GPURenderPipeline,
        triangle: GPURenderPipeline,
        bindGroup: GPUBindGroup
    } | null>(null);

    const uniformBufferRef = useRef<GPUBuffer | null>(null);
    const contextRef = useRef<GPUCanvasContext | null>(null);
    const [error, setError] = useState<string | null>(null);

    const MAX_ALTITUDE = props.yRange ? props.yRange[1] : 150;

    useEffect(() => {
        const initWebGPU = async () => {
            if (!navigator.gpu) { setError("WebGPU desteklenmiyor"); return; }
            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) { setError("Adapter yok"); return; }
            const device = await adapter.requestDevice();
            deviceRef.current = device;

            const canvas = canvasRef.current;
            if (!canvas) return;
            const context = canvas.getContext('webgpu') as unknown as GPUCanvasContext;
            contextRef.current = context;

            const format = navigator.gpu.getPreferredCanvasFormat();
            context.configure({ device, format, alphaMode: 'premultiplied' });

            const shaderModule = device.createShaderModule({ code: shaderCode });

            // Uniform Buffer (Veri köprüsü)
            const uniformBuffer = device.createBuffer({
                size: 16, // min alignment
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });
            uniformBufferRef.current = uniformBuffer;

            // Layout
            const bindGroupLayout = device.createBindGroupLayout({
                entries: [{ binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }],
            });

            const bindGroup = device.createBindGroup({
                layout: bindGroupLayout,
                entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
            });

            const layout = device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] });

            // 1. Pipeline: Çizgiler için (Line List)
            const linePipeline = device.createRenderPipeline({
                layout,
                vertex: { module: shaderModule, entryPoint: 'vs_main' },
                fragment: { module: shaderModule, entryPoint: 'fs_main', targets: [{ format }] },
                primitive: { topology: 'line-list' },
            });

            // 2. Pipeline: Uçak için (Triangle List)
            const trianglePipeline = device.createRenderPipeline({
                layout,
                vertex: { module: shaderModule, entryPoint: 'vs_main' },
                fragment: { module: shaderModule, entryPoint: 'fs_main', targets: [{ format }] },
                primitive: { topology: 'triangle-list' },
            });

            pipelinesRef.current = { line: linePipeline, triangle: trianglePipeline, bindGroup };
        };

        initWebGPU();
    }, []);

    // ÇİZİM DÖNGÜSÜ
    useEffect(() => {
        const render = () => {
            if (!deviceRef.current || !contextRef.current || !pipelinesRef.current || !uniformBufferRef.current) return;

            const altitude = props.telemetry?.altitude || 0;
            // İrtifayı 0 ile 1 arasına sıkıştır (Normalize et)
            const normalizedAltitude = Math.min(Math.max(altitude / MAX_ALTITUDE, 0), 1);

            // Veriyi Buffer'a yaz
            deviceRef.current.queue.writeBuffer(uniformBufferRef.current, 0, new Float32Array([normalizedAltitude]));

            const commandEncoder = deviceRef.current.createCommandEncoder();
            const textureView = contextRef.current.getCurrentTexture().createView();

            const passEncoder = commandEncoder.beginRenderPass({
                colorAttachments: [{
                    view: textureView,
                    clearValue: { r: 0.1, g: 0.12, b: 0.14, a: 1.0 }, // Hafif lacivert/koyu gri zemin
                    loadOp: 'clear',
                    storeOp: 'store',
                }],
            });

            const { line, triangle, bindGroup } = pipelinesRef.current;

            passEncoder.setBindGroup(0, bindGroup);

            // 1. Adım: Sabit Çizgileri Çiz (İlk 4 vertex: Dikey + Zemin)
            passEncoder.setPipeline(line);
            passEncoder.draw(4, 1, 0, 0);

            // 2. Adım: Uçağı Çiz (Sonraki 3 vertex: Üçgen)
            passEncoder.setPipeline(triangle);
            passEncoder.draw(3, 1, 4, 0);

            passEncoder.end();
            deviceRef.current.queue.submit([commandEncoder.finish()]);
        };

        render();
    }, [props.telemetry, props.yRange]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000' }}>
            {/* HTML ile Eksen Etiketleri */}
            <div style={{ position: 'absolute', top: 5, width: '100%', textAlign: 'center', color: '#fff' }}>
                {props.title || "Yanal Profil (WebGPU)"}
            </div>

            {/* Sol Eksen Yazıları */}
            <div style={{ position: 'absolute', left: '12%', top: '5%', color: '#aaa', fontSize: '10px' }}>
                {MAX_ALTITUDE}m
            </div>
            <div style={{ position: 'absolute', left: '12%', bottom: '12%', color: '#aaa', fontSize: '10px' }}>
                0m
            </div>

            {/* Anlık İrtifa Değeri (Opsiyonel: Uçağın yanına da yazılabilir ama basitlik için sabit yerde) */}
            <div style={{
                position: 'absolute',
                right: 10, top: 10,
                color: '#0f0', fontWeight: 'bold', fontFamily: 'monospace'
            }}>
                ALT: {props.telemetry?.altitude?.toFixed(1)} m
            </div>

            {error ? <div style={{ color: 'red' }}>{error}</div> :
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} width={800} height={600} />
            }
        </div>
    );
};

export default WebGPUSideView;