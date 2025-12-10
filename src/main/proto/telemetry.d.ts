import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace iha_telemetry. */
export namespace iha_telemetry {

    /** Properties of a FlightData. */
    interface IFlightData {

        /** FlightData latitude */
        latitude?: (number|null);

        /** FlightData longitude */
        longitude?: (number|null);

        /** FlightData altitude */
        altitude?: (number|null);

        /** FlightData speed */
        speed?: (number|null);

        /** FlightData heading */
        heading?: (number|null);

        /** FlightData battery */
        battery?: (number|null);

        /** FlightData timestamp */
        timestamp?: (number|Long|null);

        /** FlightData roll */
        roll?: (number|null);

        /** FlightData pitch */
        pitch?: (number|null);
    }

    /** Represents a FlightData. */
    class FlightData implements IFlightData {

        /**
         * Constructs a new FlightData.
         * @param [properties] Properties to set
         */
        constructor(properties?: iha_telemetry.IFlightData);

        /** FlightData latitude. */
        public latitude: number;

        /** FlightData longitude. */
        public longitude: number;

        /** FlightData altitude. */
        public altitude: number;

        /** FlightData speed. */
        public speed: number;

        /** FlightData heading. */
        public heading: number;

        /** FlightData battery. */
        public battery: number;

        /** FlightData timestamp. */
        public timestamp: (number|Long);

        /** FlightData roll. */
        public roll: number;

        /** FlightData pitch. */
        public pitch: number;

        /**
         * Creates a new FlightData instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FlightData instance
         */
        public static create(properties?: iha_telemetry.IFlightData): iha_telemetry.FlightData;

        /**
         * Encodes the specified FlightData message. Does not implicitly {@link iha_telemetry.FlightData.verify|verify} messages.
         * @param message FlightData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: iha_telemetry.IFlightData, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified FlightData message, length delimited. Does not implicitly {@link iha_telemetry.FlightData.verify|verify} messages.
         * @param message FlightData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: iha_telemetry.IFlightData, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FlightData message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns FlightData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): iha_telemetry.FlightData;

        /**
         * Decodes a FlightData message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns FlightData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): iha_telemetry.FlightData;

        /**
         * Verifies a FlightData message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a FlightData message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns FlightData
         */
        public static fromObject(object: { [k: string]: any }): iha_telemetry.FlightData;

        /**
         * Creates a plain object from a FlightData message. Also converts values to other types if specified.
         * @param message FlightData
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: iha_telemetry.FlightData, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this FlightData to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for FlightData
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}
