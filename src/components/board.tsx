import styles from "../../styles/Home.module.css";
import React, { useState, useRef, useEffect, useMemo } from "react";
import MechState, { MechStatus, MechType } from "../types/MechState";
import Unit from "./unit";
import UnitState, { BgStatus, BorderStatus, UnitText } from "../types/UnitState";
import Grid from "../types/Grid";
import Operator, { OPERATOR_TYPES, PlacingFormula } from "../types/Operator";
import OperatorGridBg from "./OperatorGridBg";
import { Constraints, DEMO_SOLUTIONS, Modes, Lesson_names } from "../constants/constants";
import { useTranslation } from "react-i18next";
import "../../config/i18n";
import { Box, Button, Container, Tooltip } from "@mui/material";
import { ANIM_FRAME_LATENCY } from "../constants/constants";
import AtomState, { AtomType } from "../types/AtomState";
import { useSpring, animated } from "react-spring";
import MechUnit from "./MechUnit";
import LessonInstruction from "./lessonInstruction";

import SchoolIcon from "@mui/icons-material/School";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";

import SoundFont from '../modules/sf2-player/src';

// notes played in previous frame
var prev_notes: number[] = [];
// notes played by onClicking Grid cells
var preview_notes: number[] = [];

interface BoardProps {
    mode: Modes;
    animationState: string;
    objective: string;
    instruction: string[];
    operatorStates: Operator[];
    operatorInputHighlight: boolean[];
    placingFormula?: PlacingFormula;
    unitStates: UnitState[][];
    consumableAtomTypes: AtomType[][];
    produceableAtomTypes: AtomType[][];
    mechStates: MechState[];
    atomStates: AtomState[];
    mechIndexHighlighted: number;
    handleMouseOver: (x: number, y: number) => void;
    handleMouseOut: () => void;
    handleUnitClick: (x: number, y: number) => void;
    playMidiNum: (x: number) => void,
    stopMidiNum: (x: number) => void,
    consumedAtomIds: string[];
    producedAtomIds: string[];
}

export default function Board({
    mode,
    animationState,
    objective = "",
    instruction = [],
    operatorStates,
    operatorInputHighlight,
    placingFormula,
    unitStates,
    consumableAtomTypes,
    produceableAtomTypes,
    mechStates,
    atomStates,
    mechIndexHighlighted,
    handleMouseOver,
    handleMouseOut,
    handleUnitClick,
    playMidiNum,
    stopMidiNum,
    consumedAtomIds,
    producedAtomIds,
}: BoardProps) {
    // console.log('consumedAtomIds:',consumedAtomIds)
    // console.log('producedAtomIds',producedAtomIds)

    // Unpack constants given mode
    const DIM = Constraints[mode].DIM;

    if (!mechStates) return <></>;

    // build mapping from mech_i to possessed atom (if any)
    var possessedAtom = mechStates.map((_) => null);
    for (const atomState of atomStates) {
        if (atomState.possessed_by !== null) {
            const mech_i: number = +atomState.possessed_by.replace("mech", "");
            possessedAtom[mech_i] = atomState;
        }
    }

    const frets = [
        [48, 50, 53, 55, 57, 60, 62, 65, 67, 69],
        [50, 53, 55, 57, 60, 62, 65, 67, 69, 72],
        [53, 55, 57, 60, 62, 65, 67, 69, 72, 74],
        [55, 57, 60, 62, 65, 67, 69, 72, 74, 77],
        [57, 60, 62, 65, 67, 69, 72, 74, 77, 79],
        [60, 62, 65, 67, 69, 72, 74, 77, 79, 81],
        [62, 65, 67, 69, 72, 74, 77, 79, 81, 84],
        [65, 67, 69, 72, 74, 77, 79, 81, 84, 86],
        [67, 69, 72, 74, 77, 79, 81, 84, 86, 89],
        [69, 72, 74, 77, 79, 81, 84, 86, 89, 91],
      ];


    // test looping and firing note.play in parent
    if (mode == Modes.daw && animationState=='Run'){
        
        mechStates.forEach(mechState => {
            prev_notes.forEach(prev_note => {
                stopMidiNum(prev_note);
            });
            prev_notes = [];
            playMidiNum(frets[mechState.index.x][mechState.index.y]);
            prev_notes.push(frets[mechState.index.x][mechState.index.y])
            console.log(prev_notes)
        });
    }

    const BOX_DIM: number = 10 * 2 + 10 * 2 * 0.2 + 2;
    const BOARD_DIM: number = DIM * 2 + DIM * 2 * 0.2 + 2; // unit is rem; reflect the dimensions, padding and margin set in CSS
    const board = (
        <div
            style={{
                width: `${BOX_DIM}rem`,
                height: `${BOX_DIM}rem`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
            }}
        >
            {(mode !== Modes.arena) && (mode !== Modes.daw) ? (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "left",
                        p: 2,
                        backgroundColor: "#ffffff",
                        mb: 3,
                        border: 1,
                        borderRadius: 4,
                        boxShadow: 3,
                        height: 150,
                        overflow: "hidden",
                    }}
                >
                    <ListItem sx={{ pl: 0, pt: 0 }}>
                        <ListItemIcon sx={{ minWidth: "30px" }}>
                            <SchoolIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{Lesson_names[mode]}</ListItemText>
                    </ListItem>

                    <p
                        style={{
                            textAlign: "left",
                            fontSize: "0.85rem",
                            marginTop: "0",
                            marginBottom: "1.3rem",
                        }}
                    >
                        Objective: {objective}
                    </p>

                    <LessonInstruction lesson={mode} />
                </Box>
            ) : null}

            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width: BOARD_DIM.toString() + "rem",
                    height: BOARD_DIM.toString() + "rem",
                    border: 1,
                    borderRadius: 4,
                    boxShadow: 3,
                    backgroundColor: "#FDF5E6",
                }}
            >
                <div className={styles.grid_parent} style={{}}>
                    <OperatorGridBg
                        operators={operatorStates}
                        highlighted={operatorInputHighlight}
                        placingFormula={placingFormula}
                        dim={DIM}
                    />

                    {mechStates.map((mechState, mech_i) => (
                        <MechUnit mechState={mechState} possessedAtom={possessedAtom[mech_i]} />
                    ))}

                    {Array.from({ length: DIM }).map(
                        (
                            _,
                            i // i is y
                        ) => (
                            <div key={`row-${i}`} className={styles.grid_row}>
                                {Array.from({ length: DIM }).map(
                                    (
                                        _,
                                        j // j is x
                                    ) => {
                                        // if (unitStates[j][i].unit_id !== null) console.log(unitStates[j][i].unit_id)
                                        const isConsumed =
                                            unitStates[j][i].unit_id == null
                                                ? false
                                                : !consumedAtomIds
                                                ? false
                                                : consumedAtomIds.includes(unitStates[j][i].unit_id);
                                        const isProduced =
                                            unitStates[j][i].unit_id == null
                                                ? false
                                                : !producedAtomIds
                                                ? false
                                                : producedAtomIds.includes(unitStates[j][i].unit_id);

                                        if (isConsumed) console.log(`isConsumed at (i,j)=(${i},${j})`);
                                        if (isProduced) console.log(`isProduced at (i,j)=(${i},${j})`);

                                        return (
                                            <Tooltip
                                                title={`${j},${i}`}
                                                disableInteractive
                                                arrow
                                                enterDelay={0}
                                                leaveDelay={0}
                                                TransitionProps={{ timeout: 100 }}
                                            >
                                                <div key={`${j}-${i}`}>
                                                    <Unit
                                                        key={`unit-${j}-${i}`}
                                                        state={unitStates[j][i]}
                                                        consumableAtomType={consumableAtomTypes[j][i]}
                                                        produceableAtomType={produceableAtomTypes[j][i]}
                                                        handleMouseOver={() => handleMouseOver(j, i)}
                                                        handleMouseOut={() => {
                                                            if (mode == Modes.daw) {
                                                                preview_notes.forEach(preview_note => {
                                                                    stopMidiNum(preview_note);
                                                                });
                                                                preview_notes = [];
                                                            }
                                                            handleMouseOut()}
                                                        }
                                                        onClick={() => {
                                                            if (mode == Modes.daw) {
                                                                preview_notes.forEach(preview_note => {
                                                                    stopMidiNum(preview_note);
                                                                });
                                                                preview_notes = [];
                                                                playMidiNum(frets[j][i]);
                                                                preview_notes.push(frets[j][i])
                                                                console.log(preview_notes)
                                                            }
                                                            handleUnitClick(j, i);
                                                        }}
                                                        mechHighlight={
                                                            mechIndexHighlighted == -1
                                                                ? false
                                                                : j == mechStates[mechIndexHighlighted].index.x &&
                                                                  i == mechStates[mechIndexHighlighted].index.y
                                                                ? true
                                                                : false
                                                        }
                                                        isSmall={false}
                                                        isConsumed={isConsumed}
                                                        isProduced={isProduced}
                                                    />
                                                </div>
                                            </Tooltip>
                                        );
                                    }
                                )}
                            </div>
                        )
                    )}
                </div>
            </Box>
        </div>
    );

    // Render
    return board;
}
