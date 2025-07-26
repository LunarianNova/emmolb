import { Vector2 } from "../../types/Vector2";

export const positions: Record<string, Vector2> = {
    'FirstBaseman': new Vector2(560, 280),
    'SecondBaseman': new Vector2(500, 220),
    'Shortstop': new Vector2(300, 220),
    'ThirdBaseman': new Vector2(235, 280),
    'LeftFielder': new Vector2(160, 160),
    'CenterFielder': new Vector2(400, 80),
    'RightFielder': new Vector2(640, 160),
    'Pitcher': new Vector2(400, 325),
    'LeftHandedBatter': new Vector2(432, 500),
    'RightHandedBatter': new Vector2(368, 500),
    'Home': new Vector2(400, 500),
    'Catcher': new Vector2(400, 560),
    'First': new Vector2(541.5, 325),
    'Second': new Vector2(400, 190),
    'Third': new Vector2(256.5, 325),
    'AwayDugout': new Vector2(400, 370),
    'HomeDugout': new Vector2(600, 370),
}

export const fielderLabels: Record<string, string> = {
    "CenterFielder": "CF",
    "LeftFielder": "LF",
    "RightFielder": "RF",
    "FirstBaseman": "1B",
    "SecondBaseman": "2B",
    "Shortstop": "SS",
    "ThirdBaseman": "3B",
    "Pitcher": "P",
    "Catcher": "C",
};

export const inverseFielderLabels: Record<string, string> = {
    "CF": "CenterFielder",
    "LF": "LeftFielder",
    "RF": "RightFielder",
    "1B": "FirstBaseman",
    "2B": "SecondBaseman",
    "SS": "Shortstop",
    "3B": "ThirdBaseman",
    "P": "Pitcher",
    "C": "Catcher",
};