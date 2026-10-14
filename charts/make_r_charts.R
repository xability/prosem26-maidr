# Draws the two R charts the deck shows, with the maidr R package, and saves
# each as a page of its own beside this script. slides.qmd puts those pages on
# its slides, and the code on the slides is the code below.
#
# The deck runs on a Python kernel, which cannot run R chunks, so these are
# drawn ahead of time. Run this again after changing a chart, then re-render
# the deck:
#
#   Rscript charts/make_r_charts.R
#
# Needs maidr 0.5.0 or later, as released on CRAN, and ggplot2.

library(maidr)
library(ggplot2)

stopifnot(packageVersion("maidr") >= "0.5.0")

# This script's folder under Rscript, the working directory otherwise.
script <- sub("^--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE))
out_dir <- if (length(script)) dirname(normalizePath(script)) else getwd()

# Slide "R: One Line"
bar <- ggplot(mpg, aes(class)) +
  geom_bar(fill = "steelblue") +
  labs(title = "Cars by class", x = "Class", y = "Number of cars")

# Slide "R: Layers". The mapping sits in ggplot(), not in geom_histogram():
# a layer that maps y itself is read by that expression, not by the axis
# title (xability/r-maidr#349).
hist_density <- ggplot(mpg, aes(hwy, after_stat(density))) +
  geom_histogram(bins = 15, fill = "steelblue") +
  geom_density(linewidth = 1) +
  labs(title = "Highway fuel economy",
       x = "Highway miles per gallon", y = "Density")

save_html(bar, file.path(out_dir, "r-bar.html"), use_cdn = TRUE)
save_html(hist_density, file.path(out_dir, "r-hist-density.html"), use_cdn = TRUE)
