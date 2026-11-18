from fastapi import APIRouter

from app.schemas.laboratorios.dashboard import LaboratoryDashboardKPIs


router = APIRouter(
    prefix="/api/v1/laboratories/dashboard",
    tags=["Laboratories - Dashboard"],
)


@router.get("/kpis", response_model=LaboratoryDashboardKPIs)
def get_dashboard_kpis(period: str = "Week"):
    """
    RF-LAB08:
    Laboratory Dashboard and Occupancy Indicators.

    Returns laboratory usage and occupancy indicators.
    """
    pass
