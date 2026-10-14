"""Presentation-only workaround for py-maidr's inverted horizontal box order.

Keep data and selectors paired; do not change the drawing or statistics.
Remove this module and its two hidden slide calls after upgrading to an
upstream release that fixes the issue referenced in slides.qmd.
"""
from importlib.metadata import version


def install_box_order_workaround():
    """Patch this render process temporarily; return a function restoring it.

    py-maidr 1.27.0 reverses horizontal boxes without checking yaxis_inverted.
    maidr.js expects top-to-bottom input and reverses it for bottom-up
    navigation. Undo only the exporter reversal for an inverted category axis.
    This narrow workaround assumes the ordinary category drawing order used
    by this slide, not arbitrary custom positions or multi-hue layers.
    """
    from maidr.core.plot.boxplot import BoxPlot

    installed = version("maidr")
    if installed != "1.27.0":
        raise RuntimeError(
            f"Recheck/remove the box-order workaround after changing maidr "
            f"from 1.27.0 to {installed}."
        )
    original_render = BoxPlot.render

    def render_in_visual_order(self):
        layer = original_render(self)
        if layer.get("orientation") == "horz" and self.ax.yaxis_inverted():
            data = layer["data"]
            selectors = layer.get("selectors")
            if selectors is None or len(data) != len(selectors):
                raise RuntimeError("Box data and selectors must remain paired.")
            # Fresh lists: never mutate cached package data or the statistics.
            layer = dict(layer)
            layer["data"] = list(reversed(data))
            layer["selectors"] = list(reversed(selectors))
        return layer

    BoxPlot.render = render_in_visual_order

    def restore():
        if BoxPlot.render is not render_in_visual_order:
            raise RuntimeError("Another patch changed BoxPlot.render unexpectedly.")
        BoxPlot.render = original_render

    return restore
