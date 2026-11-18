from pydantic import BaseModel

class OccupancyByShift(BaseModel):
    morning: float
    afternoon: float
    evening: float

class LaboratoryRanking(BaseModel):
    position: int
    laboratory: str
    hours_per_week: float
    occupancy_rate: float

class MaintenanceAlert(BaseModel):
    laboratory: str
    message: str

class LaboratoryDashboardKPIs(BaseModel):
    average_occupancy_rate: float
    laboratories_in_use_now: int
    total_registered_laboratories: int
    classes_scheduled_today: int
    machines_under_maintenance: int

    occuancy_by_shift: OccupancyByShift

    most_demanded_laboratories: list[LaboratoryRanking]

    maintenance_alerts: list[MaintenanceAlert]