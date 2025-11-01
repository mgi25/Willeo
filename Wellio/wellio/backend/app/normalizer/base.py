from abc import ABC, abstractmethod
from typing import Iterable, Dict, Any


class Normalizer(ABC):
    @abstractmethod
    def accepts(self, source: str) -> bool:
        raise NotImplementedError

    @abstractmethod
    def normalize(self, payload: Dict[str, Any]) -> Iterable[Dict[str, Any]]:
        raise NotImplementedError
