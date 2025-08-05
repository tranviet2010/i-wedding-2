  const padWithOne = (num: number) => (num < 10 ? `0${num}` : `${num}`);


function getTimeDiff(dateStr: string) {
  const start = new Date(dateStr).getTime();
  const now = new Date().getTime();
  let diff = Math.max(0, now - start);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);
  const minutes = Math.floor(diff / (1000 * 60));
  diff -= minutes * (1000 * 60);
  const seconds = Math.floor(diff / 1000);

  return {
    days: padWithOne(days),
    hours: padWithOne(hours),
    minutes: padWithOne(minutes),
    seconds: padWithOne(seconds),
  };
}

export default getTimeDiff;