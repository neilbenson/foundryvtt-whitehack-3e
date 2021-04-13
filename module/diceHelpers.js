export const getDiceToRoll = (rollType) => {
  switch (rollType) {
    case 'doublePositive':
      return '2d20kl';
    case 'doubleNegative':
      return '2d20kh';
    default:
      return '1d20';
  }
}

export const getResultColour = (rollResult, rollTarget) => {
  if (rollResult <= rollTarget) {
    return 'green';
  } else {
    return 'red';
  }
}
