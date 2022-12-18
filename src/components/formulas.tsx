import { useState } from "react";
import { Box } from "@mui/material";
import { OPERATOR_TYPES } from "../types/Operator";
import { useTranslation } from "react-i18next";
import FormulaBlueprint from "./FormulaBlueprint";

export default function Formulas() {
    const { t } = useTranslation();
    const [open, setOpen] = useState<boolean>(false);
    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    var formulaList = [];
    Object.entries(OPERATOR_TYPES).forEach(([key, value]) =>
        formulaList.push(<FormulaBlueprint operatorType={value} />)
    );

    return (
        <Box
            flex={1}
            flexShrink={0}
            overflow="scroll"
            sx={{
                border: 1,
                borderRadius: 4,
                ml: 6,
                mr: 0,
                textAlign: "center",
                pt: 2,
                pl: 5,
                pr: 5,
                mb: 3,
                height: "15rem",
                backgroundColor:'#ffffff', boxShadow:3,
            }}
        >
            {/* <div
                className = {styles.formulas}
                style = {{
                    textAlign: 'center',
                    overflowY: 'scroll',
                }}
            > */}

            <p
                style={{
                    fontSize: "1rem",
                    marginTop: "0",
                    marginBottom: "0",
                }}
            >
                {t("tutorial.formulaList")}
            </p>
            <ol
                style={{
                    // width: "25rem",
                    marginTop: "1rem",
                    marginBottom: "2rem",
                    padding: "0",
                }}
            >
                {formulaList}
            </ol>

            {/* </div> */}
        </Box>
    );
}
