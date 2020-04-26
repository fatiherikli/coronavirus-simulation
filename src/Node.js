import React, { Component } from "react";
import classNames from "classnames";

import styles from "./Graph.module.css";
import { padding, shade } from "./utils";
import { VENUE, SUSCEPTIBLE, SICK, RECOVERED, DEAD } from "./constants";

import flag from 'country-code-emoji';

function noop() {}

const ICONS = {
  "AL": flag("AL"),
  "AX": flag("AX"),
  "AD": flag("AD"),
  "AT": flag("AT"),
  "BE": flag("BE"),
  "BG": flag("BG"),
  "BA": flag("BA"),
  "BY": flag("BY"),
  "CH": flag("CH"),
  "CZ": flag("CZ"),
  "DE": flag("DE"),
  "DK": flag("DK"),
  "ES": flag("ES"),
  "EE": flag("EE"),
  "FI": flag("FI"),
  "FR": flag("FR"),
  "GB": flag("GB"),
  "GG": flag("GG"),
  "GR": flag("GR"),
  "HR": flag("HR"),
  "HU": flag("HU"),
  "IM": flag("IM"),
  "IE": flag("IE"),
  "IS": flag("IS"),
  "IT": flag("IT"),
  "JE": flag("JE"),
  "XK": flag("XK"), // Kosovo we feel your pain, too.
  "LI": flag("LI"),
  "LT": flag("LT"),
  "LU": flag("LU"),
  "LV": flag("LV"),
  "MC": flag("MC"),
  "MD": flag("MD"),
  "MK": flag("MK"),
  "MT": flag("MT"),
  "ME": flag("ME"),
  "NL": flag("NL"),
  "NO": flag("NO"),
  "PL": flag("PL"),
  "PT": flag("PT"),
  "RO": flag("RO"),
  "SM": flag("SM"),
  "RS": flag("RS"),
  "SK": flag("SK"),
  "SI": flag("SI"),
  "SE": flag("SE"),
  "UA": flag("UA"),
  "VA": flag("VA"),
};

// TODO: Elegant solution for this one?
//const ICONS = ['AL', 'NL', 'GB'].forEach(x => x, flag(x));

export default function Node({
  layout,
  node,
  width,
  height,
  type,
  venue,
  onNodeClick = noop
}) {
  const position = layout[node.id];
  const transform = `translate(
    ${padding(position.x, width, 7)},
    ${padding(position.y, height, 30)}
  )`;

  const classes = classNames({
    [styles.node]: true,
    [styles[type]]: true,
    [styles[venue]]: true,
    [styles.susceptible]: node.state === SUSCEPTIBLE,
    [styles.sick]: node.state === SICK,
    [styles.recovered]: node.state === RECOVERED,
    [styles.dead]: node.state === DEAD,
    [styles.locked]: node.locked
  });

  return (
    <g key={`${node.id}-Node`} id={node.id} transform={transform}>
      {node.type === VENUE ? (
        <text
          className={classes}
          onClick={onNodeClick(node.id)}
          x={-8}
          y={7}
          fontSize={16}
        >
          {ICONS[node.venue]}
        </text>
      ) : node.state === 3 ? (
        <text onClick={onNodeClick(node.id)} x={-8} y={7} fontSize={16}>
          💀
        </text>
      ) : (
        <circle
          className={classes}
          r={5}
          stroke={0}
          onClick={onNodeClick(node.id)}
          fill={"black"}
        />
      )}
      {false && node.type === VENUE && (
        <text fontSize={9} x={-(node.venue.length * 3.1)} y={20} fill={"black"}>
          {node.venue.toUpperCase()}
        </text>
      )}
      {node.locked && (
        <circle r={40} fill={"none"} stroke={"gray"} strokeWidth={2} />
      )}
    </g>
  );
}
