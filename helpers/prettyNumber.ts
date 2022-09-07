const formatter = Intl.NumberFormat("en", {
  notation: "compact",
});

export default function pretty(num: number) {
  return formatter.format(num);
}
