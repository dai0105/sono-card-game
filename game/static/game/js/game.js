"use strict";


/* =========================
   CONSTANTS
========================= */

const INITIAL_CARDS = [1, 3, 5, 7, 9];

const TOTAL_ROUNDS = 5;

const REVERSE_APPEARANCE_RATE = 0.5;

const ROUND_TYPES = {
    NORMAL: "normal",
    TARGET: "target",
    REVERSE: "reverse",
};

const SCREEN_NAMES = {
    TITLE: "title",
    GAME: "game",
    RESULT: "result",
};


/* =========================
   SCREEN ELEMENTS
========================= */

const titleScreen =
    document.getElementById("title-screen");

const gameScreen =
    document.getElementById("game-screen");

const resultScreen =
    document.getElementById("result-screen");

const startButton =
    document.getElementById("start-button");

const retryButton =
    document.getElementById("retry-button");

const titleButton =
    document.getElementById("title-button");


/* =========================
   GAME ELEMENTS
========================= */

const roundNumberElement =
    document.getElementById("round-number");

const playerScoreElement =
    document.getElementById("player-score");

const cpuScoreElement =
    document.getElementById("cpu-score");

const roundInfoElement =
    document.getElementById("round-info");

const roundTypeElement =
    document.getElementById("round-type");

const roundRuleElement =
    document.getElementById("round-rule");

const cpuCardsElement =
    document.getElementById("cpu-cards");

const playerCardsElement =
    document.getElementById("player-cards");

const cpuCardCountElement =
    document.getElementById("cpu-card-count");

const playerCardCountElement =
    document.getElementById("player-card-count");

const playerBattleCardElement =
    document.getElementById("player-battle-card");

const cpuBattleCardElement =
    document.getElementById("cpu-battle-card");

const battleMessageElement =
    document.getElementById("battle-message");

const selectedCardElement =
    document.getElementById("selected-card");

const playButton =
    document.getElementById("play-button");


/* =========================
   ROUND RESULT ELEMENTS
========================= */

const roundResultPanel =
    document.getElementById("round-result-panel");

const roundResultTitleElement =
    document.getElementById("round-result-title");


const roundResultPointElement =
    document.getElementById("round-result-point");

const nextRoundButton =
    document.getElementById("next-round-button");

const playerActionArea =
    document.getElementById("player-action-area");

/* =========================
   FINAL RESULT ELEMENTS
========================= */

const resultTitleElement =
    document.getElementById("result-title");

const resultPlayerScoreElement =
    document.getElementById("result-player-score");

const resultCpuScoreElement =
    document.getElementById("result-cpu-score");

const resultPlayStyleElement =
    document.getElementById("result-play-style");

const resultPlayStyleDescriptionElement =
    document.getElementById(
        "result-play-style-description"
    );

const resultMessageElement =
    document.getElementById("result-message");


/* =========================
   GAME STATE
========================= */

let currentRound = 1;

let playerScore = 0;
let cpuScore = 0;

let playerCards = [];
let cpuCards = [];

let selectedCard = null;

let currentRoundType =
    ROUND_TYPES.NORMAL;

let currentTargetValue = null;

let targetRoundNumber = null;
let reverseRoundNumber = null;

let roundHistory = [];

let isProcessing = false;
let isShowingRoundResult = false;
let gameFinished = false;


/* =========================
   SCREEN CONTROL
========================= */

function showScreen(screenName) {
    titleScreen.hidden =
        screenName !== SCREEN_NAMES.TITLE;

    gameScreen.hidden =
        screenName !== SCREEN_NAMES.GAME;

    resultScreen.hidden =
        screenName !== SCREEN_NAMES.RESULT;

    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
}


/* =========================
   BUTTON EVENTS
========================= */

startButton.addEventListener(
    "click",
    startNewGame
);

retryButton.addEventListener(
    "click",
    startNewGame
);

titleButton.addEventListener(
    "click",
    returnToTitle
);

playButton.addEventListener(
    "click",
    handlePlayButton
);

nextRoundButton.addEventListener(
    "click",
    () => {
        handleNextRoundButton();
    }
);



/* =========================
   START / RESET
========================= */

function startNewGame() {
    resetGameState();

    decideSpecialRounds();

    prepareRound();

    renderAll();

    showScreen(SCREEN_NAMES.GAME);
}


function resetGameState() {
    currentRound = 1;

    playerScore = 0;
    cpuScore = 0;

    playerCards = [...INITIAL_CARDS];
    cpuCards = [...INITIAL_CARDS];

    selectedCard = null;

    currentRoundType =
        ROUND_TYPES.NORMAL;

    currentTargetValue = null;

    targetRoundNumber = null;
    reverseRoundNumber = null;

    roundHistory = [];

    isProcessing = false;
    isShowingRoundResult = false;
    gameFinished = false;

    playerBattleCardElement.textContent =
        "?";

    cpuBattleCardElement.textContent =
        "?";

    selectedCardElement.textContent =
        "なし";

    battleMessageElement.textContent =
        "カードを1枚選んでください。";

    roundResultPanel.hidden = true;

    playButton.disabled = true;

    playButton.textContent =
        "このカードを出す";
}


function returnToTitle() {
    isProcessing = false;
    isShowingRoundResult = false;
    gameFinished = false;

    showScreen(SCREEN_NAMES.TITLE);
}


/* =========================
   SPECIAL ROUND SETTINGS
========================= */

function decideSpecialRounds() {
    const possibleRounds = [
        2,
        3,
        4,
        5,
    ];

    targetRoundNumber =
        getRandomItem(possibleRounds);

    const reverseAppears =
        Math.random() <
        REVERSE_APPEARANCE_RATE;

    if (!reverseAppears) {
        reverseRoundNumber = null;
        return;
    }

    const reverseCandidates =
        possibleRounds.filter(
            (roundNumber) =>
                roundNumber !==
                targetRoundNumber
        );

    reverseRoundNumber =
        getRandomItem(
            reverseCandidates
        );
}


/* =========================
   ROUND PREPARATION
========================= */

function prepareRound() {
    playerActionArea.hidden = false;
    roundResultPanel.hidden = true;

    selectedCard = null;

    currentTargetValue = null;

    isProcessing = false;
    isShowingRoundResult = false;

    roundResultPanel.hidden = true;

    if (
        currentRound ===
        targetRoundNumber
    ) {
        currentRoundType =
            ROUND_TYPES.TARGET;

        currentTargetValue =
            getRandomItem(
                INITIAL_CARDS
            );

    } else if (
        reverseRoundNumber !== null &&
        currentRound ===
            reverseRoundNumber
    ) {
        currentRoundType =
            ROUND_TYPES.REVERSE;
    } else {
        currentRoundType =
            ROUND_TYPES.NORMAL;
    }

    playerBattleCardElement.textContent =
        "?";

    cpuBattleCardElement.textContent =
        "?";

    selectedCardElement.textContent =
        "なし";

    battleMessageElement.textContent =
        getRoundStartMessage();

    playButton.disabled = true;

    playButton.textContent =
        "このカードを出す";
}


function getRoundStartMessage() {
    if (
        currentRoundType ===
        ROUND_TYPES.TARGET
    ) {
        return (
            `TARGETは${currentTargetValue}。` +
            "この数字で勝つと2POINT！"
        );
    }

    if (
        currentRoundType ===
        ROUND_TYPES.REVERSE
    ) {
        return (
            "REVERSE！ " +
            "このROUNDだけ小さい数字が勝ちます。"
        );
    }

    return (
        "カードを1枚選んでください。"
    );
}


/* =========================
   RENDER
========================= */

function renderAll() {
    renderStatus();
    renderRoundInformation();
    renderPlayerCards();
    renderCpuCards();
}


function renderStatus() {
    roundNumberElement.textContent =
        `${currentRound} / ${TOTAL_ROUNDS}`;

    playerScoreElement.textContent =
        String(playerScore);

    cpuScoreElement.textContent =
        String(cpuScore);

    playerCardCountElement.textContent =
        String(playerCards.length);

    cpuCardCountElement.textContent =
        String(cpuCards.length);
}


function renderRoundInformation() {
    roundInfoElement.classList.remove(
        "normal",
        "target",
        "reverse"
    );

    roundInfoElement.classList.add(
        currentRoundType
    );

    if (
        currentRoundType ===
        ROUND_TYPES.TARGET
    ) {
        roundTypeElement.textContent =
            `TARGET ROUND：${currentTargetValue}`;

        roundRuleElement.textContent =
            `${currentTargetValue}で勝つと2 POINT`;

        return;
    }

    if (
        currentRoundType ===
        ROUND_TYPES.REVERSE
    ) {
        roundTypeElement.textContent =
            "REVERSE ROUND";

        roundRuleElement.textContent =
            "このROUNDだけ小さい数字が勝ち";

        return;
    }

    roundTypeElement.textContent =
        "NORMAL ROUND";

    roundRuleElement.textContent =
        "大きい数字が勝ち";
}


function renderPlayerCards() {
    playerCardsElement.innerHTML = "";

    const sortedCards =
        [...playerCards].sort(
            (a, b) => a - b
        );

    sortedCards.forEach(
        (cardValue) => {
            const button =
                document.createElement(
                    "button"
                );

            button.type = "button";

            button.className =
                "player-card";

            button.dataset.value =
                String(cardValue);

            button.textContent =
                String(cardValue);

            if (
                cardValue ===
                selectedCard
            ) {
                button.classList.add(
                    "selected"
                );
            }

            button.disabled =
                isProcessing ||
                isShowingRoundResult ||
                gameFinished;

            button.addEventListener(
                "click",
                () => {
                    selectPlayerCard(
                        cardValue
                    );
                }
            );

            playerCardsElement.appendChild(
                button
            );
        }
    );
}


function renderCpuCards() {
    cpuCardsElement.innerHTML = "";

    const sortedCards =
        [...cpuCards].sort(
            (a, b) => a - b
        );

    sortedCards.forEach(
        (cardValue) => {
            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "cpu-card";

            card.textContent =
                String(cardValue);

            cpuCardsElement.appendChild(
                card
            );
        }
    );
}


/* =========================
   PLAYER CARD SELECTION
========================= */

function selectPlayerCard(
    cardValue
) {
    if (
        isProcessing ||
        isShowingRoundResult ||
        gameFinished
    ) {
        return;
    }

    if (
        !playerCards.includes(
            cardValue
        )
    ) {
        return;
    }

    selectedCard = cardValue;

    selectedCardElement.textContent =
        String(cardValue);

    battleMessageElement.textContent =
        `${cardValue}を選択中。`;

    playButton.disabled = false;

    renderPlayerCards();
}


/* =========================
   PLAY CARD
========================= */

function handlePlayButton() {
    if (
        isProcessing ||
        isShowingRoundResult ||
        gameFinished
    ) {
        return;
    }

    if (selectedCard === null) {
        return;
    }

    playRound();
}


function playRound() {
    isProcessing = true;

    playButton.disabled = true;

    renderPlayerCards();

    battleMessageElement.textContent =
        "CPUがカードを選んでいます…";

    const playerSelectedCard =
        selectedCard;

    const cpuSelectedCard =
        chooseCpuCard();

    window.setTimeout(() => {
        revealCards(
            playerSelectedCard,
            cpuSelectedCard
        );
    }, 650);
}


/* =========================
   REVEAL
========================= */

function revealCards(
    playerCard,
    cpuCard
) {
    playerBattleCardElement.textContent =
        String(playerCard);

    cpuBattleCardElement.textContent =
        String(cpuCard);

    const result =
        judgeRound(
            playerCard,
            cpuCard
        );

    const earnedPoints =
        calculatePoints(
            result,
            playerCard,
            cpuCard
        );

    playerScore +=
        earnedPoints.player;

    cpuScore +=
        earnedPoints.cpu;

    saveRoundHistory(
        playerCard,
        cpuCard,
        result,
        earnedPoints
    );

    removeUsedCards(
        playerCard,
        cpuCard
    );

    renderStatus();
    renderPlayerCards();
    renderCpuCards();

    showRoundResult(
        playerCard,
        cpuCard,
        result,
        earnedPoints
    );

    isProcessing = false;
    isShowingRoundResult = true;

    renderPlayerCards();
    playerActionArea.hidden = true;

    showRoundResultPanel(
        playerCard,
        cpuCard,
        result,
        earnedPoints
    );
}


/* =========================
   ROUND JUDGEMENT
========================= */

function judgeRound(
    playerCard,
    cpuCard
) {
    if (playerCard === cpuCard) {
        return "draw";
    }

    if (
        currentRoundType ===
        ROUND_TYPES.REVERSE
    ) {
        return (
            playerCard < cpuCard
                ? "player"
                : "cpu"
        );
    }

    return (
        playerCard > cpuCard
            ? "player"
            : "cpu"
    );
}


/* =========================
   POINTS
========================= */

function calculatePoints(
    result,
    playerCard,
    cpuCard
) {
    const points = {
        player: 0,
        cpu: 0,
    };

    if (result === "draw") {
        return points;
    }

    if (result === "player") {
        points.player =
            getWinPoints(
                playerCard
            );

        return points;
    }

    points.cpu =
        getWinPoints(cpuCard);

    return points;
}


function getWinPoints(
    cardValue
) {
    if (
        currentRoundType ===
            ROUND_TYPES.TARGET &&
        cardValue ===
            currentTargetValue
    ) {
        return 2;
    }

    return 1;
}


/* =========================
   ROUND RESULT
========================= */

function showRoundResult(
    playerCard,
    cpuCard,
    result,
    earnedPoints
) {
    if (result === "draw") {
        battleMessageElement.textContent =
            "このROUNDはDRAW。";

        return;
    }

    if (result === "player") {
        if (
            earnedPoints.player === 2
        ) {
            battleMessageElement.textContent =
                "TARGET成功！ 2POINT獲得！";

            return;
        }

        battleMessageElement.textContent =
            "あなたの勝利！";

        return;
    }

    if (earnedPoints.cpu === 2) {
        battleMessageElement.textContent =
            "CPUがTARGET成功。";

        return;
    }

    battleMessageElement.textContent =
        "CPUの勝利。";
}


function showRoundResultPanel(
    playerCard,
    cpuCard,
    result,
    earnedPoints
) {
    roundResultPanel.hidden = false;

    if (result === "player") {
        roundResultTitleElement.textContent =
            "ROUND WIN!";

        roundResultPointElement.textContent =
            `+${earnedPoints.player} POINT`;

    } else if (result === "cpu") {
        roundResultTitleElement.textContent =
            "ROUND LOSE";

        roundResultPointElement.textContent =
            `CPU +${earnedPoints.cpu} POINT`;

    } else {
        roundResultTitleElement.textContent =
            "DRAW";

        roundResultPointElement.textContent =
            "NO POINT";
    }

    if (
        currentRound >=
        TOTAL_ROUNDS
    ) {
        nextRoundButton.textContent =
            "RESULTを見る";
    } else {
        nextRoundButton.textContent =
            "次のROUNDへ";
    }

    scrollToRoundResult();
}


/* =========================
   NEXT ROUND BUTTON
========================= */

function handleNextRoundButton() {

    if (currentRound >= TOTAL_ROUNDS) {
        finishGame();
        return;
    }

    currentRound += 1;

    prepareRound();
    renderAll();
    scrollToGameTop();
}


/* =========================
   CPU LOGIC
========================= */

function chooseCpuCard() {
    const cardScores =
        cpuCards.map(
            (cpuCard) => {
                return {
                    card: cpuCard,
                    score:
                        evaluateCpuCard(
                            cpuCard
                        ),
                };
            }
        );

    cardScores.sort(
        (a, b) =>
            b.score - a.score
    );

    /*
     * 基本は最高評価。
     *
     * ただし少量の揺らぎを
     * 入れて完全な最適行動には
     * しない。
     */

    const randomValue =
        Math.random();

    if (
        cardScores.length >= 3 &&
        randomValue < 0.06
    ) {
        return cardScores[2].card;
    }

    if (
        cardScores.length >= 2 &&
        randomValue < 0.18
    ) {
        return cardScores[1].card;
    }

    return cardScores[0].card;
}


function evaluateCpuCard(
    cpuCard
) {
    let totalScore = 0;

    const totalWeight =
        playerCards.reduce(
            (
                sum,
                playerCard
            ) => {
                return (
                    sum +
                    estimatePlayerCardWeight(
                        playerCard
                    )
                );
            },
            0
        );

    playerCards.forEach(
        (
            possiblePlayerCard
        ) => {
            const weight =
                estimatePlayerCardWeight(
                    possiblePlayerCard
                );

            const probability =
                weight /
                totalWeight;

            const matchupScore =
                evaluateMatchup(
                    cpuCard,
                    possiblePlayerCard
                );

            totalScore +=
                probability *
                matchupScore;
        }
    );

    totalScore +=
        evaluateCardConservation(
            cpuCard
        );

    totalScore +=
        evaluateTargetCard(
            cpuCard
        );

    totalScore +=
        evaluateScoreSituation(
            cpuCard
        );

    totalScore +=
        getSmallRandomNoise();

    return totalScore;
}


/* =========================
   CPU PLAYER PREDICTION
========================= */

function estimatePlayerCardWeight(
    playerCard
) {
    let weight = 1;

    /*
     * TARGETならプレイヤーも
     * TARGETを狙う可能性を
     * 少し高く見る。
     */

    if (
        currentRoundType ===
            ROUND_TYPES.TARGET &&
        playerCard ===
            currentTargetValue
    ) {
        weight += 1.4;
    }

    /*
     * REVERSEでは
     * 小さいカードを警戒。
     */

    if (
        currentRoundType ===
        ROUND_TYPES.REVERSE
    ) {
        weight +=
            (10 - playerCard) *
            0.1;
    }

    /*
     * NORMALでは
     * 強札使用を少し警戒。
     */

    if (
        currentRoundType ===
        ROUND_TYPES.NORMAL
    ) {
        weight +=
            playerCard *
            0.035;
    }

    /*
     * 過去に7・9を
     * 積極的に使っていれば、
     * 強札を早めに出す傾向を
     * 少しだけ見る。
     */

    const previousPlayerCards =
        roundHistory.map(
            (history) =>
                history.playerCard
        );

    const strongCardUses =
        previousPlayerCards.filter(
            (card) =>
                card >= 7
        ).length;

    if (
        strongCardUses > 0 &&
        playerCard >= 7
    ) {
        weight += 0.15;
    }

    return Math.max(
        weight,
        0.1
    );
}


/* =========================
   CPU MATCHUP EVALUATION
========================= */

function evaluateMatchup(
    cpuCard,
    playerCard
) {
    if (cpuCard === playerCard) {
        return 0.3;
    }

    const cpuWins =
        currentRoundType ===
        ROUND_TYPES.REVERSE
            ? cpuCard < playerCard
            : cpuCard > playerCard;

    if (cpuWins) {
        let winScore = 3;

        /*
         * TARGET成功なら
         * 高評価。
         */

        if (
            currentRoundType ===
                ROUND_TYPES.TARGET &&
            cpuCard ===
                currentTargetValue
        ) {
            winScore += 3.2;
        }

        /*
         * 必要以上に大差で
         * 勝たないことを評価。
         */

        const difference =
            Math.abs(
                cpuCard -
                playerCard
            );

        winScore +=
            Math.max(
                0,
                1.25 -
                    difference *
                    0.12
            );

        return winScore;
    }

    let loseScore = -2;

    /*
     * 負けてもCPUの弱札で
     * プレイヤーの強札を
     * 消費させるなら少し評価。
     */

    if (
        currentRoundType !==
            ROUND_TYPES.REVERSE &&
        cpuCard <= 3 &&
        playerCard >= 7
    ) {
        loseScore += 1.35;
    }

    if (
        currentRoundType ===
            ROUND_TYPES.REVERSE &&
        cpuCard >= 7 &&
        playerCard <= 3
    ) {
        loseScore += 1.35;
    }

    return loseScore;
}


/* =========================
   CPU CARD CONSERVATION
========================= */

function evaluateCardConservation(
    cpuCard
) {
    const roundsRemaining =
        TOTAL_ROUNDS -
        currentRound +
        1;

    if (roundsRemaining <= 1) {
        return 0;
    }

    if (
        currentRoundType ===
        ROUND_TYPES.NORMAL
    ) {
        if (cpuCard === 9) {
            return -0.8;
        }

        if (cpuCard === 7) {
            return -0.35;
        }
    }

    if (
        currentRoundType ===
        ROUND_TYPES.REVERSE
    ) {
        if (cpuCard === 1) {
            return -0.65;
        }

        if (cpuCard === 3) {
            return -0.25;
        }
    }

    return 0;
}


/* =========================
   CPU TARGET
========================= */

function evaluateTargetCard(
    cpuCard
) {
    if (
        currentRoundType !==
        ROUND_TYPES.TARGET
    ) {
        return 0;
    }

    if (
        cpuCard !==
        currentTargetValue
    ) {
        return 0;
    }

    const canWinAgainstAnyCard =
        playerCards.some(
            (playerCard) =>
                cpuCard >
                playerCard
        );

    if (!canWinAgainstAnyCard) {
        return -1.2;
    }

    return 1.8;
}


/* =========================
   CPU SCORE SITUATION
========================= */

function evaluateScoreSituation(
    cpuCard
) {
    const roundsRemaining =
        TOTAL_ROUNDS -
        currentRound +
        1;

    const scoreDifference =
        cpuScore -
        playerScore;

    /*
     * 最終ROUNDでは
     * 温存する意味がない。
     */

    if (
        roundsRemaining === 1
    ) {
        if (
            currentRoundType ===
            ROUND_TYPES.REVERSE
        ) {
            return (
                10 - cpuCard
            ) * 0.06;
        }

        return (
            cpuCard * 0.06
        );
    }

    /*
     * 負けていれば
     * 少し積極的に。
     */

    if (
        scoreDifference < 0
    ) {
        if (
            currentRoundType ===
            ROUND_TYPES.REVERSE
        ) {
            return (
                10 - cpuCard
            ) * 0.055;
        }

        return (
            cpuCard * 0.055
        );
    }

    /*
     * 勝っていれば
     * 少し温存寄り。
     */

    if (
        scoreDifference > 0
    ) {
        if (
            currentRoundType ===
            ROUND_TYPES.REVERSE
        ) {
            return (
                cpuCard *
                0.025
            );
        }

        return (
            10 - cpuCard
        ) * 0.025;
    }

    return 0;
}


/* =========================
   ROUND HISTORY
========================= */

function saveRoundHistory(
    playerCard,
    cpuCard,
    result,
    earnedPoints
) {
    roundHistory.push({
        round:
            currentRound,

        roundType:
            currentRoundType,

        targetValue:
            currentTargetValue,

        playerCard,

        cpuCard,

        result,

        playerPoints:
            earnedPoints.player,

        cpuPoints:
            earnedPoints.cpu,
    });
}


/* =========================
   REMOVE USED CARDS
========================= */

function removeUsedCards(
    playerCard,
    cpuCard
) {
    playerCards =
        playerCards.filter(
            (card) =>
                card !==
                playerCard
        );

    cpuCards =
        cpuCards.filter(
            (card) =>
                card !==
                cpuCard
        );
}


/* =========================
   FINAL RESULT
========================= */

function finishGame() {

    gameFinished = true;
    isProcessing = false;
    isShowingRoundResult = false;

    const playStyle =
        determinePlayStyle();

    const resultInformation =
        getFinalResultInformation();

    resultTitleElement.textContent =
        resultInformation.title;

    resultPlayerScoreElement.textContent =
        String(playerScore);

    resultCpuScoreElement.textContent =
        String(cpuScore);

    resultPlayStyleElement.textContent =
        playStyle.name;

    resultPlayStyleDescriptionElement.textContent =
        playStyle.description;

    resultMessageElement.textContent =
        resultInformation.message;

    showScreen(SCREEN_NAMES.RESULT);
}

function getFinalResultInformation() {
    if (
        playerScore >
        cpuScore
    ) {
        return {
            title:
                "YOU WIN!",

            message:
                "CPUとの読み合いを制しました。",
        };
    }

    if (
        playerScore <
        cpuScore
    ) {
        return {
            title:
                "CPU WIN",

            message:
                "次はCPUの一手を読み切ろう。",
        };
    }

    return {
        title:
            "MATCH DRAW",

        message:
            "互いに譲らない5ROUNDでした。",
    };
}


/* =========================
   PLAY STYLE
========================= */

function determinePlayStyle() {
    if (isLastCardWin()) {
        return {
            name:
                "LAST CARD WIN",

            description:
                "最後の1枚で試合を決めました。",
        };
    }

    if (
        countBaitRounds() >= 1
    ) {
        return {
            name:
                "BAIT MASTER",

            description:
                "弱いカードでCPUの強いカードを使わせました。",
        };
    }

    if (
        countCloseWins() >= 2
    ) {
        return {
            name:
                "PERFECT READ",

            description:
                "必要以上に強いカードを使わず、僅差の勝利を重ねました。",
        };
    }

    if (
        countHighCardWins() >= 2
    ) {
        return {
            name:
                "POWER PLAYER",

            description:
                "強いカードを効果的に勝利へつなげました。",
        };
    }

    if (
        playerScore >
        cpuScore
    ) {
        return {
            name:
                "CARD READER",

            description:
                "CPUの残り手札を読み、勝利をつかみました。",
        };
    }

    if (
        playerScore ===
        cpuScore
    ) {
        return {
            name:
                "BALANCED PLAYER",

            description:
                "攻めと温存を使い分け、互角に戦いました。",
        };
    }

    return {
        name:
            "CHALLENGER",

        description:
            "CPUの出し方を振り返り、次の勝負へ挑みましょう。",
    };
}


function countBaitRounds() {
    return roundHistory.filter(
        (history) => {
            const normalBait =
                history.roundType !==
                    ROUND_TYPES.REVERSE &&
                history.playerCard <= 3 &&
                history.cpuCard >= 7;

            const reverseBait =
                history.roundType ===
                    ROUND_TYPES.REVERSE &&
                history.playerCard >= 7 &&
                history.cpuCard <= 3;

            return (
                normalBait ||
                reverseBait
            );
        }
    ).length;
}


function countCloseWins() {
    return roundHistory.filter(
        (history) => {
            if (
                history.result !==
                "player"
            ) {
                return false;
            }

            return (
                Math.abs(
                    history.playerCard -
                    history.cpuCard
                ) === 2
            );
        }
    ).length;
}


function countHighCardWins() {
    return roundHistory.filter(
        (history) => {
            return (
                history.result ===
                    "player" &&
                history.roundType !==
                    ROUND_TYPES.REVERSE &&
                history.playerCard >= 7
            );
        }
    ).length;
}


function isLastCardWin() {
    const lastRound =
        roundHistory.at(-1);

    if (!lastRound) {
        return false;
    }

    return (
        lastRound.result ===
            "player" &&
        playerScore >
            cpuScore
    );
}


/* =========================
   SCROLL
========================= */

function scrollToGameTop() {
    gameScreen.scrollIntoView({
        behavior: "smooth",
        block: "start",
    });
}


function scrollToRoundResult() {
    roundResultPanel.scrollIntoView({
        behavior: "smooth",
        block: "center",
    });
}


/* =========================
   UTILITIES
========================= */

function getRandomItem(items) {
    const randomIndex =
        Math.floor(
            Math.random() *
            items.length
        );

    return items[randomIndex];
}


function getSmallRandomNoise() {
    return (
        Math.random() *
        0.5
    ) - 0.25;
}


/* =========================
   INITIAL DISPLAY
========================= */

showScreen(
    SCREEN_NAMES.TITLE
);