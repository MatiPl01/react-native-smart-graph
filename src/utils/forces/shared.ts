import {AnimatedPositionCoordinates} from '@/types/layout';
import {Vector} from '@shopify/react-native-skia';

export const applyForces = (forces: Record<string, Vector>, verticesPositions: Record<string, AnimatedPositionCoordinates>) => {
    Object.entries(verticesPositions).forEach(([vertexKey, vertexPosition]) => {
        const force = forces[vertexKey] as Vector;
        vertexPosition.x.value += force.x;
        vertexPosition.y.value += force.y;
    });
};
