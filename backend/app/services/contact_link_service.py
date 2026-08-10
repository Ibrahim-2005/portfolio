"""
app/services/contact_link_service.py
"""
from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.contact_link import ContactLink
from app.schemas.contact_link import ContactLinkCreate, ContactLinkUpdate


def get_all_public(db: Session) -> Sequence[ContactLink]:
    return db.scalars(
        select(ContactLink)
        .where(ContactLink.enabled.is_(True))
        .order_by(ContactLink.sort_order.asc(), ContactLink.id.asc())
    ).all()

def get_all_admin(db: Session) -> Sequence[ContactLink]:
    return db.scalars(
        select(ContactLink)
        .order_by(ContactLink.sort_order.asc(), ContactLink.id.asc())
    ).all()

def get_by_id(db: Session, link_id: int) -> ContactLink | None:
    return db.get(ContactLink, link_id)

def create(db: Session, obj_in: ContactLinkCreate) -> ContactLink:
    db_obj = ContactLink(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update(db: Session, db_obj: ContactLink, obj_in: ContactLinkUpdate) -> ContactLink:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete(db: Session, db_obj: ContactLink) -> None:
    db.delete(db_obj)
    db.commit()
