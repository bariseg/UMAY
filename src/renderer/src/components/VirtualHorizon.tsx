import React from 'react'
import { TelemetryData } from '../interfaces/interfaces'

interface VirtualHorizonProps {
    telemetry: TelemetryData | null
}

const VirtualHorizon: React.FC<VirtualHorizonProps> = ({ telemetry }) => {
    // Veri yoksa varsayılan 0 değerlerini kullan
    const pitch = telemetry?.pitch ?? 0
    const roll = telemetry?.roll ?? 0

    // PITCH HESABI:
    // Uçak burnunu kaldırdığında (pozitif pitch), ufuk çizgisi aşağı inmeli.
    // 1 derece başına kaç piksel kayacağını belirleyelim (Hassasiyet).
    const pixelsPerDegree = 4
    const translateY = pitch * pixelsPerDegree

    // ROLL HESABI:
    // Uçak sağa yattığında (pozitif roll), ufuk sola dönmüş gibi görünür.
    const rotate = -roll

    return (
        <div style={styles.container}>
            {/* Dış Çerçeve (Tam Boyut Dikdörtgen) */}
            <div style={styles.instrumentCase}>

                <div style={styles.title}>SANAL UFUK</div>

                {/* Hareketli Ufuk Katmanı (Gökyüzü ve Yer) */}
                <div
                    style={{
                        ...styles.horizonLayer,
                        transform: `rotate(${rotate}deg) translateY(${translateY}px)`
                    }}
                >
                    <div style={styles.sky}></div>
                    <div style={styles.ground}></div>
                </div>

                {/* Sabit Uçak Referans İşareti (Merkezdeki Sarı Kanatlar) */}
                <div style={styles.referenceAircraft}>
                    <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
                        {/* Sol Kanat */}
                        <path d="M 10 50 L 40 50 L 40 52 L 10 52 Z" fill="#fbbf24" stroke="black" strokeWidth="0.5" />
                        {/* Sağ Kanat */}
                        <path d="M 60 50 L 90 50 L 90 52 L 60 52 Z" fill="#fbbf24" stroke="black" strokeWidth="0.5" />
                        {/* Merkez Nokta */}
                        <circle cx="50" cy="50" r="1.5" fill="#fbbf24" stroke="black" strokeWidth="0.5" />
                        {/* Aşağı Ok (Burun) */}
                        <path d="M 50 50 L 47 55 L 53 55 Z" fill="#fbbf24" stroke="black" strokeWidth="0.5" />
                    </svg>
                </div>

                {/* Üstteki Roll Göstergesi (Sabit Üçgen) */}
                <div style={styles.rollIndicator}>
                    <svg width="20" height="10" viewBox="0 0 20 10">
                        <polygon points="0,0 20,0 10,10" fill="white" />
                    </svg>
                </div>

                {/* Sayısal Değerler (Overlay) */}
                <div style={styles.readoutOverlay}>
                    <div style={styles.readoutBox}>P: {pitch.toFixed(1)}°</div>
                    <div style={styles.readoutBox}>R: {roll.toFixed(1)}°</div>
                </div>

            </div>
        </div>
    )
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#222',
        borderRadius: '8px',
        padding: '4px', // Dış boşluk
        boxSizing: 'border-box'
    },
    instrumentCase: {
        width: '100%',
        height: '100%',
        borderRadius: '6px', // Hafif yuvarlak
        border: '1px solid #444',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#000'
    },
    title: {
        position: 'absolute',
        top: 8,
        left: 10,
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '0.7em',
        fontWeight: 'bold',
        zIndex: 10,
        pointerEvents: 'none'
    },
    horizonLayer: {
        width: '300%', // Dikdörtgen olduğu için daha geniş (köşegen kurtarması için)
        height: '300%',
        position: 'absolute',
        top: '-100%', // Merkezi ortalamak için
        left: '-100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.1s linear'
    },
    sky: {
        flex: 1,
        backgroundColor: '#3b82f6', // Daha canlı bir mavi
        borderBottom: '2px solid white'
    },
    ground: {
        flex: 1,
        backgroundColor: '#854d0e', // Daha doğal toprak rengi
        position: 'relative'
    },
    referenceAircraft: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '200px', // Sabit genişlik verelim ki SVG bozulmasın
        height: '200px',
        transform: 'translate(-50%, -50%)',
        zIndex: 5,
        pointerEvents: 'none'
    },
    rollIndicator: {
        position: 'absolute',
        top: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 6
    },
    readoutOverlay: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
        display: 'flex',
        justifyContent: 'space-between',
        zIndex: 10
    },
    readoutBox: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: '4px 8px',
        borderRadius: '4px',
        color: '#4ade80', // Parlak yeşil
        fontFamily: 'monospace',
        fontSize: '1em',
        fontWeight: 'bold'
    }
}

export default VirtualHorizon