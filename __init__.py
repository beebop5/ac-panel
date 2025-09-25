"""Air Conditioner Panel for Home Assistant."""
import logging

_LOGGER = logging.getLogger(__name__)

DOMAIN = "ac_panel"

async def async_setup(hass, config):
    """Set up the Air Conditioner Panel component."""
    return True
