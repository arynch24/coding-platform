export function formatDate(
  date: Date, 
  style: "numeric" | "2-digit" | "long" | "short" | "narrow" = "long"
): string {
  const options: Intl.DateTimeFormatOptions = { 
    day: "numeric", 
    month: style, 
    year: "numeric" 
  };

  return new Intl.DateTimeFormat("en-GB", options).format(date);
}
