use criterion::{BenchmarkId, criterion_group, criterion_main, Criterion};
use quoridor::board_state::BoardState;
use quoridor::vector2::Vector2;
use quoridor::wall_orientation::WallOrientation;
use quoridor::minimax_player::MinimaxPlayer;

fn minimax_benchmark(c: &mut Criterion) {
    
    let mut board_state = BoardState::new();
    board_state.set_wall(Vector2::new(0, 0), WallOrientation::Horizontal);
    board_state.set_wall(Vector2::new(2, 0), WallOrientation::Horizontal);
    board_state.set_wall(Vector2::new(4, 0), WallOrientation::Horizontal);
    board_state.set_wall(Vector2::new(5, 1), WallOrientation::Vertical);
    board_state.set_wall(Vector2::new(4, 2), WallOrientation::Horizontal);
    board_state.set_wall(Vector2::new(1, 1), WallOrientation::Vertical);
    board_state.set_wall(Vector2::new(0, 2), WallOrientation::Horizontal);

    let mut group = c.benchmark_group("minimax_3");
    for depth in [1, 2, 3].iter() {
        group.bench_with_input(BenchmarkId::from_parameter(depth), depth, |b, &depth| {
            b.iter(|| MinimaxPlayer::take_action(&board_state, 0, depth));
        });
    }
    group.finish();
}

criterion_group!(benches, minimax_benchmark);
criterion_main!(benches);
